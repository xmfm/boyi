import random
import pickle


BLACK = 1
WHITE = -1

grid = 15
root = None
board_dict = {}
board_hash = [[[random.getrandbits(63) for _ in range(2)] for _ in range(grid)] for _ in range(grid)]


class Node:
    len = 0

    def __init__(self, pos):
        self.pos = pos
        self.parent = None
        self.children = []
        self.have_brother = False
        Node.len += 1


class Robot:
    def __init__(self):
        self.name = 'Robot'
        self.color = None
        self.room = None
        self.on_line = True
        self.movables = set()  # 可走的点的集合
        self.lib_node = None  # 棋谱上的当前节点，脱谱时为 None
        self.lib_hash = board_hash[root.pos[0]][root.pos[1]][0]  # 当前局面 Hash，脱谱时为 0
        self.parent_symmetry = (True, True, True, True, True)  # 上一局面的对称性
        self.node_symmetry = []  # 当前节点的对称变换

    def oppo(self):
        if self.room.player0 == self:
            return self.room.player1
        else:
            return self.room.player0

    # 计算下一步并返回结果
    def move(self):
        if self.color != BLACK:
            p = random.choice(list(self.movables))
        elif len(self.room.notation) == 0:
            p = root.pos
            self.lib_node = root
        else:
            if self.lib_node:  # 是否已脱谱
                # self.move_from_tree()
                self.move_from_dict()
            if self.lib_node:  # 是否脱谱
                p = self.lib_node.pos
                for i in self.node_symmetry[::-1]:
                    p = self.to_symmetry()[i](p)
            else:  # 脱谱时
                print('脱谱')
                p = random.choice(list(self.movables))

        self.room.know(p);print('c',p)
        return p

    # 在棋谱上搜索
    def move_from_tree(self):
        pos = self.room.notation[-1]
        sym = list(self.parent_symmetry)
        for i in self.node_symmetry:
            pos = self.to_symmetry()[i](pos)
            if i == 1 or i == 2:
                sym[3], sym[4] = sym[4], sym[3]
            elif i == 3 or i == 4:
                sym[1], sym[2] = sym[2], sym[1]

        for child in self.lib_node.children:
            for i in range(5):
                if sym[i] and self.to_symmetry()[i](pos) == child.pos and child.children:
                    self.lib_node = random.choice(child.children)
                    if i != 0:
                        self.node_symmetry.insert(0, i)
                    return
        self.lib_node = None

    def move_from_dict(self):
        pos = self.room.notation[-1]
        sym = list(self.parent_symmetry)
        print(pos)
        for i in self.node_symmetry:
            pos = self.to_symmetry()[i](pos)
            if i == 1 or i == 2:
                sym[3], sym[4] = sym[4], sym[3]
            elif i == 3 or i == 4:
                sym[1], sym[2] = sym[2], sym[1]
        print(pos, sym)
        for child in board_dict.setdefault(self.lib_hash, []):
            # print('a', child.pos)
            for i in range(5):
                if sym[i] and self.to_symmetry()[i](pos) == child.pos:
                    self.lib_hash ^= board_hash[child.pos[0]][child.pos[1]][1]
                    children = board_dict.setdefault(self.lib_hash, [])
                    # print(i, child.pos)
                    for p in self.movables:
                        p = self.to_symmetry()[i](p)
                        for ii in self.node_symmetry:
                            p = self.to_symmetry()[ii](p)
                        if board_dict.get(self.lib_hash ^ board_hash[p[0]][p[1]][0]):
                            children.append(Node(p))
                    for c in children:
                        print('b', c.pos)
                    if children:
                        self.lib_node = random.choice(children)
                        if i != 0:
                            self.node_symmetry.insert(0, i)
                        self.lib_hash ^= board_hash[self.lib_node.pos[0]][self.lib_node.pos[1]][0]
                        return
        self.lib_node = None
        self.lib_hash = 0

    def know(self, point):
        if self.lib_node and self.room.turn == self:
            # 计算当前局面对称性
            self.parent_symmetry = (True, self.x_symmetry(), self.y_symmetry(), self.t_symmetry(), self.f_symmetry())
            print(self.parent_symmetry)
        self.movables.discard(point)

        x = point[0]
        y = point[1]
        for i in range(x-2, x+3):
            for j in range(y-2, y+3):
                if 0 <= i < grid and 0 <= j < grid and not self.room.board[i][j]:
                    self.movables.add((i, j))

    def clear(self):
        self.movables.clear()
        self.lib_node = root
        self.lib_hash = board_hash[root.pos[0]][root.pos[1]][0]
        self.parent_symmetry = (True, True, True, True, True)
        self.node_symmetry.clear()

    # 返回对坐标对称变换的函数列表
    @classmethod
    def to_symmetry(cls):
        return (lambda p: (p[0], p[1]), lambda p: (p[0], grid-1-p[1]), lambda p: (grid-1-p[0], p[1]),
                lambda p: (p[1], p[0]), lambda p: (grid-1-p[1], grid-1-p[0]))

    # x轴对称
    def x_symmetry(self):
        for i in range(grid):
            for j in range(grid//2):
                if self.room.board[i][j] != self.room.board[i][-j-1]:
                    return False
        return True

    # y轴对称
    def y_symmetry(self):
        for i in range(grid//2):
            for j in range(grid):
                if self.room.board[i][j] != self.room.board[-i-1][j]:
                    return False
        return True

    # 转置
    def t_symmetry(self):
        for i in range(grid):
            for j in range(grid):
                if i > j and self.room.board[i][j] != self.room.board[j][i]:
                    return False
        return True

    # 对称转置
    def f_symmetry(self):
        for i in range(grid):
            for j in range(grid):
                if i + j < grid and self.room.board[i][j] != self.room.board[-j-1][-i-1]:
                    return False
        return True


def to_tree(file):
    root = None  # 根节点
    pre = None  # 上一个节点
    pre_have = 0b00  # 上一个节点信息
    node = None  # 当前节点
    odd = True  # 是奇数字节
    for i in file:
        if odd:  # 奇数字节
            node = Node((i >> 4, (i & 0xf) - 1))  # 单字节存储的位置信息转存为(x, y)
        else:  # 偶数字节
            if pre_have == 0b00:  # 无弟有子
                if pre:  # 非根
                    node.parent = pre
                    pre.children.append(node)
                else:  # 根
                    root = node
            elif pre_have == 0b10:  # 有弟有子
                node.parent = pre
                pre.children.append(node)
                pre.have_brother = True
            elif pre_have == 0b11:  # 有弟无子
                node.parent = pre.parent
                pre.parent.children.append(node)
                pre.have_brother = True
            elif pre_have == 0b01:   # 无弟无子
                while not pre.have_brother and pre.parent:
                    pre = pre.parent
                else:
                    if not pre.parent:  # 文件未结束时先序遍历链断裂
                        print('文件有错误')
                        return root
                    node.parent = pre.parent
                    pre.parent.children.append(node)
            pre = node
            pre_have = i >> 6
        odd = not odd
    return root


def to_map(nd, clr, key, b_hash, b_dict):
    key ^= b_hash[nd.pos[0]][nd.pos[1]][(clr - 1) // -2]
    if nd.children:
        b_dict[key] = nd.children
        for n in nd.children:
            to_map(n, -clr, key, b_hash, b_dict)
    key ^= b_hash[nd.pos[0]][nd.pos[1]][(clr - 1) // -2]


def save():
    with open('lib/无禁.lib', 'br') as f, open('bin/py.bin', 'wb') as fp:
        f.read(22)
        root = to_tree(f.readline())
        to_map(root, 1, 0, board_hash, board_dict)
        print(len(board_dict), Node.len)
        pickle.dump(root, fp)
        pickle.dump(board_dict, fp)
        pickle.dump(board_hash, fp)


def load():
    with open('bin/py.bin', 'rb') as fp:
        global root, board_dict, board_hash
        root = pickle.load(fp)
        board_dict = pickle.load(fp)
        board_hash = pickle.load(fp)


# save()
load()

if __name__ == '__main__':
    a = board_hash[8][8][0]^board_hash[7][8][1]^board_hash[8][7][0]^board_hash[7][7][0]^board_hash[6][8][1]
    for i in board_dict.get(a, []):
        print(i.pos)
