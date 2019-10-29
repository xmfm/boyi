from flask_socketio import emit
from flask import session
from flask import current_app as app
import random

from web.db import *


class Game:
    def __init__(self):
        self.rooms = {}
        self.playings = {}
        self.waitings = {}

    def socket_init(self, namespace='/'):
        socket = app.socket

        @socket.on('connect', namespace=namespace)
        def connect():
            app.player = self.playings.get(session['user_id'])
            if not app.player:  # 玩家未在对局
                app.player = Player()
                self.playings[session['user_id']] = app.player
            else:  # 玩家为掉线重连，发送当前所有对局信息
                app.player = self.playings[session['user_id']]
                if app.player.room:
                    app.room = app.player.room
                    emit('history', app.room.get_all())

            print('\'', User.query.get(session['user_id']).username, '\' connected in \'', namespace, '\'')

        @socket.on('disconnect', namespace=namespace)
        def disconnect():
            print('\'', app.player.name, '\' disconnected in \'', namespace, '\'')

        @socket.on('start', namespace=namespace)
        def start(mag):
            if not app.player.room:
                ...
            else:
                ...

        @socket.on('player', namespace=namespace)
        def receive(mag):
            if app.player.room:
                ...


class Room:
    def __init__(self, players):
        self.id = 0
        self.players = players


class Player:
    def __init__(self):
        self.id = session['user_id']
        self.name = User.query.get(self.id).username
        self.room = None


class Robot:
    def __init__(self):
        self.name = 'Robot'
        self.room = None

