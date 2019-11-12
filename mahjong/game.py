import random

from mahjong.tile import *


class Game:
    def __init__(self, players):   # three = False, jp = True
        self.wall = []  # 牌山
        self.build_wall()
        self.players = tuple(players)  # 玩家

        self.wind = 0  # 几场
        self.turn = 1  # 几局
        self.times = 0  # 几本

        self.dora_point = []  # 宝牌指示牌
        self.dora_point_ura = []  # 里宝牌指示牌
        self.to_dora_point()

        self.locat_player = 0  # locat player of number
        self.locat = 0  # locat tile of number in wall
        self.locat_dis_tile = None  # locat discard tile
        self.last_tile = ALL_TILES_NUM - KING_TILES_NUM  # last tile of number in wall

        for i in range(4):  # 玩家本局座次
            self.players[i].wind = i  # ['東','南','西','北']

    def build_wall(self, seed=None):
        self.wall = [Tile(kind) for kind in range(34) for _ in range(4)]
        self.wall[4 * 4].set_red()
        self.wall[4 * 4 + 4 * 9].set_red()
        self.wall[4 * 4 + 4 * 9 * 2].set_red()
        # print(self.wall)
        if seed:
            random.seed(seed)
        random.shuffle(self.wall)
        # print(self.wall)

    def deal(self):  # 发牌
        tiles = []
        for i in range(4):
            tiles.append(self.wall[13*i:13*(i+1)])
            self.players[i].deal(tiles[i])
        self.locat = 13*4
        return tiles

    def draw(self):  # 摸牌
        self.players[self.locat_player].draw(self.wall[self.locat])
        self.locat += 1
        return self.wall[self.locat-1]

    def act(self, tiles_order, to_player, action):  # 吃 碰 杠 胡
        self.players[to_player].act(tiles_order, self.locat_dis_tile, self.locat_player, action)

    def discard(self, tile_order):
        self.locat_dis_tile = self.players[self.locat_player].handTiles[tile_order]
        action = [None]*4
        for i in range(4):
            if self.locat_player != i:
                action[i] = self.players[i].can_act(self.locat_dis_tile)
        return tuple(action)

    def point_dora(self, tile_int):  # 宝牌指示牌指示宝牌
        if tile_int in (8, 17, 26):
            return tile_int - 8
        elif tile_int == 33:
            return 27
        else:
            return tile_int + 1

    def to_dora_point(self):
        self.dora_point.append(self.wall[-(6+len(self.dora_point)*2)])


if __name__ == '__main__':
    from mahjong.player import *
    newgame = Game([Player(), Player(), Player(), Player()])
    print(newgame.wall)
