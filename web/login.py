import functools

from flask_socketio import emit, Namespace
from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for, current_app as app
)
from werkzeug.security import check_password_hash, generate_password_hash

from web.db import *


class LoginNamespace(Namespace):
    def on_connect(self):
        user_id = session.get('user_id')
        if user_id is None:
            emit('logined', {'logined': 'no'})
            print('游客进入')
        else:
            app.user = User.query.get(user_id)
            emit('logined', {'logined': 'yes', 'id': app.user.username})
            print('\'', app.user.username, '\' 进入')

    def on_disconnect(self):
        if session.get('user_id'):
            print('\'', app.user.username, '\'退出')
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
            session.clear()
            session['user_id'] = user.id
            app.user = user
            emit('login', {'login': 'ok', 'user_id': user.id})

    def on_logout(self):
        session.clear()
        del app.user
        emit('logout', {'logout': 'ok'})

    def on_register(self, msg):
        if User.query.filter(User.username == msg['username']).first():
            emit('register', {'reg': 'fail', 'error': 'id'})
        else:
            user = User(username=msg['username'], password=generate_password_hash(msg['password']))
            db.session.add(user)
            db.session.commit()
            emit('register', {'reg': 'ok'})
