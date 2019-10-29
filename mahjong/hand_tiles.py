from mahjong.tile import *


class HandTiles:
    def __init__(self):
        self.handTiles = []
        self.set = [0]*TILES_KINDS

        self.hdtl_isolate = []  # 孤牌组成的列表
        self.hdtl_combine = []  # 非孤牌组成的二维列表
        self.hdtl_lonely = []  # 单牌组成的列表
        self.hdtl_plural = []  # 非单牌组成的二维列表
        self.hdtl_splite = []  # 分片后手牌组成的二维列表

        self.distances_melds = 10  # 面子手向和数（向听数+1）
        self.distances_seven = 10  # 七对子向和数（向听数+1）
        self.distances_thirteen = 15  # 国士无双向和数（向听数+1）

    def extend(self, tiles):
        """
        配牌传入列表，排序，计算向和数
        :param tiles: 配牌
        :return: None
        """
        self.handTiles.extend(tiles)
        self.sort()
        for index, tile in enumerate(self.handTiles):
            tile.set_order(index)
            self.set[tile.int] += 1

        orphans_set = set()  # 幺九牌的int值的集合
        for tile in self.handTiles:
            if not self.hdtl_lonely or self[self.hdtl_lonely[-1]] != tile:
                if not self.hdtl_plural or self[self.hdtl_plural[-1][-1]] != tile:
                    self.hdtl_lonely.append(tile.order)  # 新牌暂时放入单张牌列表
                else:
                    self.hdtl_plural[-1].append(tile.order)  # 第三或第四张相同牌
            else:
                self.hdtl_plural.append([self.hdtl_lonely.pop(), tile.order])  # 第二张相同牌

            if not self.hdtl_isolate or tile - self[self.hdtl_isolate[-1]] > 2:
                if not self.hdtl_combine or tile - self[self.hdtl_combine[-1][-1]] > 2:
                    self.hdtl_isolate.append(tile.order)  # 新牌暂时放入单张牌列表
                else:
                    self.hdtl_combine[-1].append(tile.order)
            else:
                self.hdtl_combine.append([self.hdtl_isolate.pop(), tile.order])

            if tile.is_orphan():
                orphans_set.add(tile.int)

        num_about_kinds = 7 - len(self.hdtl_lonely) - len(self.hdtl_plural)  # 不足七种牌的数量
        num_about_kinds = 0 if num_about_kinds < 0 else num_about_kinds  # 超过七种则置零
        self.distances_seven = 7 - len(self.hdtl_plural) + num_about_kinds  # 七减对子数并补足七种牌

        orphans_plural = False  # 是否有幺九对
        for tiles_order in self.hdtl_plural:
            if self.handTiles[tiles_order[0]].is_orphan():
                orphans_plural = True
                break
        self.distances_thirteen = 14 - len(orphans_set) - orphans_plural  # 十四减幺九种类和幺九对

        tiles_left = self.set.copy()
        distances_melds = 9
        melds = 0
        pair = False
        for i in range(TILES_KINDS_DISHONOR):
            if i % 9 < 7 and 1 == tiles_left[i] == tiles_left[i+1] == tiles_left[i+2]:
                tiles_left[i] -= 1
                tiles_left[i+1] -= 1
                tiles_left[i+2] -= 1
                distances_melds -= 2
                melds += 1
        for i in range(TILES_KINDS_DISHONOR):
            if i % 9 < 7 and tiles_left[i] and tiles_left[i+1] and tiles_left[i+2]:
                tiles_left[i] -= 1
                tiles_left[i+1] -= 1
                tiles_left[i+2] -= 1
                distances_melds -= 2
                melds += 1
        for i in range(TILES_KINDS):
            if tiles_left[i] > 2:
                tiles_left[i] -= 3
                distances_melds -= 2
                melds += 1
        for i in range(TILES_KINDS):
            if tiles_left[i] > 1:
                if not pair:
                    tiles_left[i] -= 2
                    distances_melds -= 1
                    pair = True
                elif melds < 4:
                    tiles_left[i] -= 2
                    distances_melds -= 1
                    melds += 1
        for i in range(TILES_KINDS_DISHONOR):
            if melds < 4 and i % 9 < 8 and tiles_left[i] and (tiles_left[i+1] or tiles_left[i+2]):
                tiles_left[i] -= 1
                if tiles_left[i+1]:
                    tiles_left[i+1] -= 1
                else:
                    tiles_left[i+2] -= 1
                distances_melds -= 1
                melds += 1
        self.distances_melds = distances_melds

    def append(self, tile):
        self.handTiles.append(tile)
        self.set[tile.int] += 1
        self.sort()

        for tiles_order in self.hdtl_plural:
            if self.handTiles[tiles_order[0]] == tile:
                tiles_order.append(tile.order)
                break
        else:
            my_tile_order = self.find(tile, rtn='i')
            if my_tile_order != -1:
                self.hdtl_plural.append([my_tile_order, tile.order])
            else:
                self.hdtl_lonely.append(tile.order)

    def sort(self):
        self.handTiles.sort(key=lambda x: x.int)

    def pop(self, i=-1):
        self.set[self.handTiles[i].int] -= 1
        return self.handTiles.pop(i)

    def __bool__(self):
        return bool(self.handTiles)

    def __len__(self):
        return len(self.handTiles)

    def __setitem__(self, key, value):
        if 0 <= key < len(self.handTiles) and 0 <= value < TILES_KINDS:
            self.handTiles[key] = value

    def __getitem__(self, item):
        return self.handTiles[item] if 0 <= item < len(self.handTiles) else None

    def __contains__(self, tile):
        return tile in self.handTiles

    def __str__(self):
        return str(self.handTiles)
    __repr__ = __str__

    def int_list(self):
        return [int(i) for i in self.handTiles]

    def str_list(self):
        return [str(i) for i in self.handTiles]

    def find(self, tile, func=lambda t1, t2: int(t1)-int(t2), rtn='o', first=False):
        a, b = 0, len(self.handTiles)
        i = (a+b)//2
        result = -1
        while True:
            func_return = func(self.handTiles[i], tile)
            if a == b:
                if func_return == 0:
                    result = i
                break
            elif func_return > 0:
                b = i
                i = (a+b)//2
            elif func_return < 0:
                a = i+1
                i = (a+b)//2
            else:
                result = i
                break
        if first and result != -1:
            if i > 0 and func(self.handTiles[i-1], tile) == 0:
                result = i-1
            elif i > 1 and func(self.handTiles[i-2], tile) == 0:
                result = i-2
            elif i > 2 and func(self.handTiles[i-3], tile) == 0:
                result = i-3
        if rtn == 'i':
            return result
        elif rtn == 'b':
            return True if result != -1 else False
        elif rtn == 'o':
            return self.handTiles[result] if result != -1 else None
        else:
            raise ValueError

    def update_distances_sp_push(self, tile):
        same_tile_order = self.find(tile, rtn='i')  # 与摸牌相同的手牌所在序号

        if (same_tile_order != -1 and same_tile_order in self.hdtl_lonely
                or same_tile_order == -1 and len(self.hdtl_lonely) + len(self.hdtl_plural) < 7):
            self.distances_seven -= 1

        if tile.is_orphan():
            if tile not in self.handTiles:
                self.distances_thirteen -= 1
            else:
                if self[same_tile_order-1] != tile != self[same_tile_order+1]:
                    for tiles_order in self.hdtl_plural:
                        if self.handTiles[tiles_order[0]].is_orphan():
                            self.distances_thirteen -= 1
                            break

    @classmethod
    def remove_sequence(cls, tiless):
        result_tiless = []
        for tiles in tiless:
            if len(tiles) < 3:
                result_tiless.append([])
            elif len(tiles) == 3:
                if tiles[2]-tiles[1] == tiles[1]-tiles[0] == 0:
                    result_tiless.append(tiles)
                    tiless.remove(tiles)
                else:
                    result_tiless.append([])

    def can_peng(self, tile):
        if self.set[tile] >= 2:
            return True
        else:
            return False

    def can_gang(self, tile):
        if self.set[tile] == 3:
            return True
        else:
            return False

    def can_chi(self, tile):
        num = tile.int % 9
        a = self.set[tile.int-2] if num > 1 else 0
        b = self.set[tile.int-1] if num > 0 else 0
        c = self.set[tile.int+1] if num < 8 else 0
        d = self.set[tile.int+2] if num < 7 else 0
        if a and b or b and c or c and d:
            return True
        else:
            return False


if __name__ == '__main__':
    from mahjong.tile import *
    hd = HandTiles()
    hd.extend([Tile(k) for k in (28, 29, 1, 2, 3, 4, 5, 10, 10, 17, 18, 20, 23)])
    print(hd, hd.hdtl_plural, hd.hdtl_lonely,
          hd.set, hd.hdtl_isolate, hd.hdtl_combine,
          hd.distances_thirteen, hd.distances_seven, hd.distances_melds, hd.find(Tile(25), rtn='i'))


    def enum(tiles, count, score, num, pair, already):
        if len(tiles) <= 1 and score > count:
            count = score
        else:
            new_tiles = tiles.copy()
            new_tiles.pop(0)
            if not already:
                enum(new_tiles, count, score, num, pair, True)
            new_tiles.pop(0)
            if tiles[1]-tiles[0] == 0:
                pass


