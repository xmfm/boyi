import os, sys, time
from flask import Flask, session, request, jsonify, current_app
from flask_socketio import SocketIO
import flask_sqlalchemy as sqla
from flask_apscheduler import APScheduler

from web import mainbp
from web.config import configs
from web.db import *
from web import login, go_five, mj_jp

# sys.stderr = sys.stdout


def app_run(**kwargs):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(configs['test'])

    # ensure the instance folder exists
    # try:
    #     os.makedirs(app.instance_path)
    # except OSError:
    #     pass

    db.init_app(app)
    # db.create_all()
    socketio = SocketIO(app)

    # app.register_blueprint(mainbp.bp)

    scheduler = APScheduler()
    scheduler.init_app(app)
    scheduler.start()

    @app.route('/')
    @app.route('/<path:string>')
    def main(string=''):
        return app.send_static_file('game.html')

    @app.route('/', methods=['post'])
    def reset_session():
        if request.form.get('user_id'):
            session['user_id'] = request.form.get('user_id')
            return jsonify({'ok': 'ok'})

    five = go_five.FiveNamespace('/five')
    mj = mj_jp.MJNamespace('/mj')
    socketio.on_namespace(login.LoginNamespace('/'))
    socketio.on_namespace(five)
    socketio.on_namespace(mj)

    socketio.start_background_task(five.five_start)
    # scheduler.add_job(func=lambda: go_five.five_start(socketio), id='123', trigger='interval', seconds=5)
    # scheduler.add_job(func=lambda: print(time.time()), id='23', trigger='interval', seconds=5)
    # return app.run(**kwargs)
    socketio.run(app, **kwargs)


if __name__ == '__main__':
    print('>>>>>>>>>>>>>>>>>>>>>>>>>')
    app_run(debug=False, host='0.0.0.0')
