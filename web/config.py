class TestConfig:
    SECRET_KEY = 'test'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/test.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SCHEDULER_API_ENABLED = True

    MAIL_SERVER = 'smtp.exmail.qq.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = 'neko@neko.ren'
    MAIL_PASSWORD = 'CrLwfgSoBurigkYp'
    MAIL_DEFAULT_SENDER = 'neko@neko.ren'


configs = {
    'test': TestConfig
}