from mahjong.hand_tiles import *

CHI = 1
PENG = 2
GANG = 3


class Player:
    def __init__(self):
        self.level = 0
        self.point = 25000
        self.wind = 0
        self.handTiles = HandTiles()
        self.discardTiles = []
        self.displayTiles = []

    def __str__(self):
        return ['東', '南', '西', '北'][self.wind]
    __repr__ = __str__

    def deal(self, tiles):
        self.handTiles.extend(tiles)

    def draw(self, tile):
        self.handTiles.append(tile)

    def sort(self):
        self.handTiles.sort()

    def discard(self, i):
        self.handTiles.pop(i)

    def can_act(self, tile):
        rtn = []
        if self.handTiles.can_gang(tile):
            rtn.append(GANG)
            rtn.append(PENG)
        elif self.handTiles.can_peng(tile):
            rtn.append(PENG)

        if self.handTiles.can_chi(tile):
            rtn.append(CHI)

        return rtn

    def act(self, tiles_order, tile, from_player, action):
        try:
            display_tiles = [self.handTiles[tiles_order[0]], self.handTiles[tiles_order[1]]]
            if action == GANG:
                display_tiles.append(self.handTiles[tiles_order[2]])
            display_tiles.append(tile)
            self.displayTiles.append((tuple(display_tiles), from_player, action))
        except IndexError:
            return False
        self.handTiles.pop(tiles_order[0])
        self.handTiles.pop(tiles_order[1])
        if action == GANG:
            self.handTiles.pop(tiles_order[2])
        return True

    def is_win(self):
        return False
