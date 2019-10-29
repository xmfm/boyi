import flask_sqlalchemy as sqla


db = sqla.SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(10), unique=True, nullable=False)
    nickname = db.Column(db.String(20))
    email = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(64))
