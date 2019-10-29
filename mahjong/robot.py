from mahjong.player import *


class Robot(Player):
    def __init__(self):
        Player.__init__(self)

    def auto_discard(self):
        return 0

