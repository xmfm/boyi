from flask_socketio import emit, Namespace, join_room
from flask import session, request

import random

from web.db import *
from mahjong import Game, Player as MJPlayer, Robot as MJRobot

rooms_free = set(range(1000, 10000))
rooms_playing = set()
players_playing = {}
dani_waiting = set()
compete_waiting = set()

DONG = 0
NAN = 1
XI = 2
BEI = 3


class Room:
    def __init__(self, players):
        self.id = 0
        self.players = players
        self.game = Game(players)
        self.turn = self.players[0]

        for player in players:
            player.room = self

    def info(self, player):
        information = {'wind': player.wind,
                       'dora_point': list(map(lambda x: x.int_have_red, self.game.dora_point))}
        for i in range(4):
            information[f'player{i}'] = {'id': self.players[i].id,
                                         'name': self.players[i].name,
                                         'wind': self.players[i].wind,
                                         'level': self.players[i].level,
                                         'point': self.players[i].point}
        return information

    def turn_go(self):
        turn = self.players.index(self.turn)
        self.turn = self.players[(turn+1) % 4]


class Player(MJPlayer):
    def __init__(self):
        MJPlayer.__init__(self)
        self.id = session.user.id
        self.name = User.query.get(self.id).username
        self.room = None
        self.socket_id = request.sid
        self.on_line = False


class Robot(MJRobot):
    def __init__(self):
        MJRobot.__init__(self)
        self.id = 0
        self.name = 'Robot'
        self.room = None
        self.on_line = True


class MJNamespace(Namespace):
    def on_act(self, msg):
        if msg['act'] == 'discard':
            print('discard', msg['data'])
        elif msg['act'] == 'skip':
            ...
        elif msg['act'] == 'chi':
            ...
        elif msg['act'] == 'peng':
            ...
        elif msg['act'] == 'gang':
            ...

    def on_discard(self, msg):
        print(session.user.username, 'discard', msg['tile'])

    def on_connect(self):
        if session.user.id not in players_playing:
            session.player = Player()
        else:
            session.player = players_playing[session.user.id]
        print('\'', session.user.username, '\' connected')

    def on_disconnect(self):
        print('\'', session.user.username, '\' disconnected')

    def on_ready(self, msg):
        if msg['type'] == 'dani':
            dani_waiting.add(session.player)
        elif msg['type'] == 'compete':
            compete_waiting.add(session.player)
        elif msg['type'] == 'robot':
            # players_playing[session.user.id] = session.player
            session.room = Room(random.sample((session.player, Robot(), Robot(), Robot()), 4))
            print(session.player.wind)
            session.room.id = random.sample(rooms_free, 1)[0]
            rooms_free.remove(session.room.id)
            emit('start', session.room.info(session.player))

    def on_ready_ok(self, msg):
        session.room = session.player.room
        join_room(session.room.id)
        session.player.on_line = True
        emit('ready_ok', {'player': session.player.wind},
             room=session.room.id, include_self=False)
        if all([*map(lambda x:x.on_line, session.room.players)]):
            self.socketio.sleep(1)
            deal_tiles = session.room.game.deal()
            for player in session.room.players:
                if player.name != 'Robot':
                    emit('deal', {'deal': list(map(lambda x: x.int_have_red,
                                                   deal_tiles[player.wind]))},
                         room=player.socket_id)
            while session.room.turn.name == 'Robot':
                self.socketio.sleep(1)
                self.draw()
            self.socketio.sleep(1)
            self.draw()

    def draw(self):
        draw = session.room.game.draw().int_have_red
        self.socketio.emit('draw', {'player': session.room.turn.wind},
                           room=session.room.id,
                           namespace=self.namespace)
        if session.room.turn.name != 'Robot':
            self.socketio.emit('draw', {'draw': draw},
                               room=session.room.turn.socket_id,
                               namespace=self.namespace)
        session.room.turn_go()

    def five_start(self):
        while True:
            if len(dani_waiting):
                print(len(dani_waiting), end=',')
            waitings = (dani_waiting, compete_waiting)
            for waiting in waitings:
                if len(waiting) >= 4:
                    room = Room(random.sample(waiting, 4))
                    rooms_playing.add(room)
                    room.id = random.sample(rooms_free, 1)[0]
                    rooms_free.remove(room.id)
                    for i in range(4):
                        waiting.remove(room.players[i])
                        self.socketio.emit('start', room.info(room.players[i]),
                                           room=room.players[i].socket_id,
                                           namespace=self.namespace)
            self.socketio.sleep(3)
