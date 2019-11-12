from flask_socketio import emit, Namespace, rooms, join_room
from flask import session, request
from flask_apscheduler import APScheduler

import random

from web.db import *
from web.renlib import Robot as FiveRobot

rooms_free = set(range(1000, 10000))
rooms_playing = set()
players_playing = {}
dani_waiting = set()
compete_waiting = set()
on_liners = {}

grid = 15  # 路数

BLACK = 1
WHITE = -1


class Room:
    def __init__(self, players):
        self.id = 0
        self.type = 0
        self.player0 = players[0]
        self.player1 = players[1]
        self.turn = self.player0
        self.board = [[0]*grid for _ in range(grid)]
        self.notation = []

        self.player0.room = self
        self.player0.color = BLACK
        self.player1.room = self
        self.player1.color = WHITE

    def know(self, point):
        # self.turn = self.turn.oppo()

        self.notation.append(point)
        self.board[point[0]][point[1]] = len(self.notation) % 2 * 2 - 1

        self.player0.know(point)
        self.player1.know(point)

        self.turn = self.turn.oppo()

    def clear(self):
        self.board = [[0]*grid for _ in range(grid)]
        self.notation.clear()

    def is_win(self):
        point = self.notation[-1]  # 当前落点
        color = self.board[point[0]][point[1]]  # 当前落子颜色
        for ix, iy in (1, 0), (1, 1), (0, 1), (-1, 1):  # 遍历四个方向
            n = 1  # 连珠数量
            for ix, iy in (ix, iy), (-ix, -iy):  # 正反方向
                p = [point[0] + ix, point[1] + iy]  # 先移动一步
                # 移动后仍是有效点且有己方棋子则继续前进且连珠数加一
                while 0 <= p[0] < grid and 0 <= p[1] < grid and self.board[p[0]][p[1]] == color:
                    n += 1
                    p[0] += ix
                    p[1] += iy
            if n >= 5:  # 五子连珠
                self.turn = None
                return color
        return False


class Player:
    def __init__(self):
        self.id = session.user.id
        self.name = User.query.get(self.id).username
        self.room = None
        self.socket_id = request.sid
        self.color = None
        self.on_line = False

    def oppo(self):
        if self.room.player0 == self:
            return self.room.player1
        else:
            return self.room.player0

    def know(self, point):
        ...


class DDict(dict):
    def __init__(self, *args, **kwargs):
        dict.__init__(self, *args, **kwargs)
        self.__dict__ = self


class FiveNamespace(Namespace):
    def on_player(self, msg):  # 收到玩家落子信息
        if session.player != session.room.turn:
            print('客户端错误')
            print(session.player.name, session.room.turn.name)
            return
        point = tuple(msg['move'])
        session.room.know(point)
        winner = session.room.is_win()
        if session.player.oppo().name != 'Robot':
            if not winner:
                emit('oppo', {'move': list(point)}, room=session.room.id, include_self=False)
            else:
                emit('oppo', {'move': list(point), 'finish': {'winner': winner}},
                     room=session.room.id, include_self=False)
                emit('finish', {'winner': winner})
        else:
            if not winner:
                p = list(session.player.oppo().move())
                winner = session.room.is_win()
                if not winner:
                    emit('oppo', {'move': p}, room=session.room.id)
                else:
                    emit('oppo', {'move': p, 'finish': {'winner': winner}})
            else:
                emit('finish', {'winner': winner})

    def on_ready_ok(self, msg):  # 收到玩家开始游戏的信息
        session.room = session.player.room
        join_room(session.room.id)
        session.player.on_line = True
        if session.player.on_line and session.player.oppo().on_line:
            session.room.turn = session.room.player0
        if session.room.player0.name == 'Robot':
            emit('oppo', {'move': list(session.room.player0.move())})
        else:
            emit('ready_ok', {'player': 'oppo'}, room=session.room.id, include_self=False)

    def on_connect(self):  # 建立连接
        if session.user.id not in players_playing:  # 玩家未在对局
            session.player = Player()
            on_liners[session.user.id] = session.player
        else:  # 玩家在对局中，即玩家为掉线重连，则发送当前局谱
            session.player = players_playing[session.user.id]
            if session.player.room:
                session.room = session.player.room
                emit('history', {'moves': [list(n) for n in session.room.notation]})
        # session.player.socket_id = rooms()[0]
        print('\'', session.player.name, '\' connected')

    def on_ready(self, msg):
        if msg['type'] == 'dani':
            dani_waiting.add(session.player)
        elif msg['type'] == 'compete':
            compete_waiting.add(session.player)
        elif msg['type'] == 'robot':
            robot = FiveRobot()
            # app.room = Room(random.sample((session.player, robot), 2))
            # app.room = Room((session.player, robot))
            session.room = Room((robot, session.player))
            session.room.id = random.sample(rooms_free, 1)[0]
            rooms_free.remove(session.room.id)
            emit('start', {'oppo': robot.name, 'color': session.player.color})

    def on_disready(self):
        ...

    def on_disconnect(self):
        if session.user.id in on_liners:
            session.player = on_liners[session.user.id]
            session.room = session.player.room
        else:
            session.player = None
            session.room = None

        if session.user.id in players_playing:
            players_playing.pop(session.user.id)
            session.player = session.room = None
        print('\'', session.player.name, '\' disconnected\'')

    def on_five_in(self, msg):
        self.get_player()

    def five_start(self):
        while True:
            if len(dani_waiting):
                print(len(dani_waiting), end=',')
            waitings = (dani_waiting, compete_waiting)
            for waiting in waitings:
                if len(waiting) >= 2:
                    room = Room(random.sample(waiting, 2))
                    player0 = room.player0
                    player1 = room.player1
                    waiting.remove(player0)
                    waiting.remove(player1)
                    rooms_playing.add(room)
                    room.id = random.sample(rooms_free, 1)[0]
                    rooms_free.remove(room.id)

                    self.socketio.emit('start', {'oppo': player1.name, 'color': player0.color},
                                       room=player0.socket_id, namespace=self.namespace)
                    self.socketio.emit('start', {'oppo': player0.name, 'color': player1.color},
                                       room=player1.socket_id, namespace=self.namespace)
            self.socketio.sleep(3)

