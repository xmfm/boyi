ALL_TILES_NUM = 136
ALL_TILES_NUM_FLOWER = 144
KING_TILES_NUM = 14
TILES_KINDS = 34
TILES_KINDS_DISHONOR = 27


class Tile:

    lang_is_jp = True
    __slots__ = ("__kind", "__order", "__red")

    def __init__(self, kind, red=False):
        self.__kind = kind
        self.__order = -1
        if Tile.lang_is_jp:
            self.__red = red

    @property
    def suit(self):
        return self.__kind // 9 if self.__kind < TILES_KINDS_DISHONOR else self.__kind - TILES_KINDS_DISHONOR + 3

    @property
    def nmbr(self):
        return (self.__kind % 9 + 1) if self.__kind // 9 < 3 else 0

    @property
    def int_have_red(self):
        return (self.__kind // 9 + 1) * 10 + (self.__kind % 9 + 1) * (not self.__red)

    @property
    def red(self):
        return self.__red

    @property
    def order(self):
        return self.__order

    def set_red(self):
        if not self.__red:
            self.__red = True

    def set_order(self, order):
        if 0 <= order <= 13:
            self.__order = order
        else:
            raise ValueError

    @property
    def int(self):
        return self.__kind

    def __int__(self):
        return self.__kind

    def __eq__(self, other):
        if not isinstance(other, Tile):
            return NotImplemented
        return self.__kind == other.int

    def __hash__(self):
        return hash(id(self))

    def __str__(self):
        if self.lang_is_jp:
            if self.suit < 3:
                return str(self.nmbr) + ('m', 'p', 's')[self.suit]
            else:
                return str(self.int % 9 + 1) + 'z'
            # 萬餅索東南西北白發中
        else:
            if self.suit < 3:
                return str(self.nmbr) + ('w', 'b', 't')[self.suit]
            else:
                return ('dong', 'nan', 'xi', 'bei', 'zhong', 'fa', 'bai')[self.int % 9]
            # 萬餅條東南西北中發白
    __repr__ = __str__

    def __cmp__(self, other):
        if int(self) > int(other):
            return 1
        elif int(self) < int(other):
            return -1
        else:
            return 0

    def __sub__(self, other):
        if self.suit == other.suit:
            if self.suit < 3:
                return self.nmbr - other.nmbr
            else:
                return 0 if self.int == other.int else 10
        else:
            return 10

    def is_orphan(self):
        """
        是否为幺九字牌
        :return: boolean
        """
        return self.nmbr in (1, 9, 0)

    def is_honor(self):
        """
        是否为字牌
        :return: boolean
        """
        return self.nmbr == 0

    def is_near(self, other):
        return -3 < self - other < 3


if __name__ == '__main__':
    a = [Tile(13), Tile(18)]
    b = Tile(18)
    print(a.index(b))

