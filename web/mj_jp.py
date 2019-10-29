from flask_socketio import emit, Namespace, join_room
from flask import session, current_app as app, request

import random

from web.db import *
from mahjong import Game

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
        self.player0 = players[0]
        self.player1 = players[1]
        self.player2 = players[2]
        self.player3 = players[3]
        self.game = Game(players)
        self.turn = self.player0

        self.player0.room = self
        self.player0.wind = DONG
        self.player1.room = self
        self.player1.wind = NAN
        self.player2.room = self
        self.player2.wind = XI
        self.player3.room = self
        self.player3.wind = BEI


class Player:
    def __init__(self):
        self.id = session['user_id']
        self.name = User.query.get(self.id).username
        self.room = None
        self.socket_id = request.sid
        self.wind = 0
        self.on_line = False


class Robot:
    def __init__(self):
        ...


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

    def on_connect(self):
        if session['user_id'] not in players_playing:
            app.player = Player()
        print('\'', app.user.username, '\' connected')

    def on_disconnect(self):
        print('\'', app.user.username, '\' disconnected')

    def on_ready(self, msg):
        if msg['type'] == 'dani':
            dani_waiting.add(app.player)
        elif msg['type'] == 'compete':
            compete_waiting.add(app.player)
        elif msg['type'] == 'robot':
            players_playing[session['user_id']] = app.player
            app.room = Room(random.sample((app.player, Robot(), Robot(), Robot()), 4))
            app.room.id = random.sample(rooms_free, 1)[0]
            rooms_free.remove(app.room.id)
            emit('start', {'hand': [11, 22, 33, 44]})

    def on_ready_ok(self, msg):
        app.room = app.player.room
        join_room(app.room.id)
        app.player.on_line = True
        emit('ready_ok', '')
