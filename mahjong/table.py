from mahjong.game import *
from mahjong.robot import *


class Table:
    def __init__(self, players):
        self.players = players
        for _ in range(4-len(players)):
            self.players.append(Robot())
        random.shuffle(self.players)
        self.game = Game(players)
        for p in self.players:
            if type(p) == Robot:
                p.game = self.game
