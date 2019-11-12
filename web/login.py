import functools

from flask_socketio import emit, Namespace
from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash
from flask_mail import Message

from web.db import *


class LoginNamespace(Namespace):
    def __init__(self, *args, mail=None, **kwargs):
        Namespace.__init__(self, *args, **kwargs)
        self.mail = mail

    def on_connect(self):
        session.user = None
        if session.get('user_id'):
            session.user = User.query.get(session.get('user_id'))
        if session.user:
            emit('logined', {'logined': 'yes', 'id': session.user.username})
            print('\'', session.user.username, '\' 进入')
        else:
            emit('logined', {'logined': 'no'})
            print('游客进入')
        # message = Message(subject='test', recipients=['nihili@126.com'], body='test')
        # self.mail.send(message)

    def on_disconnect(self):
        if session.user:
            print('\'', session.user.username, '\'退出')
        else:
            print('游客退出')

    def on_login(self, msg):
        username = msg['username']
        password = msg['password']
        user = User.query.filter(User.username == username).first()

        if user is None:
            emit('login', {'login': 'fail', 'error': 'id'})
        elif not check_password_hash(user.password, password):
            emit('login', {'login': 'fail', 'error': 'pw'})
        else:
            # session.clear()
            session.user = user
            emit('login', {'login': 'ok', 'user_id': user.id})

    def on_logout(self):
        # session.clear()
        # self.user = None
        emit('logout', {'logout': 'ok'})

    def on_register(self, msg):
        if User.query.filter(User.username == msg['username']).first():
            emit('register', {'reg': 'fail', 'error': 'id'})
        else:
            user = User(username=msg['username'], password=generate_password_hash(msg['password']))
            db.session.add(user)
            db.session.commit()
            emit('register', {'reg': 'ok'})

