from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///D:/test2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    age = db.Column(db.Integer)

    def __repr__(self):
        return '<User ' + self.username + '>'


# db.create_all()
#
# db.session.add(User(username='a', age=11))
# db.session.add(User(username='b', age=12))
# db.session.commit()

print(User.query.get(1))
