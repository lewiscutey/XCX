//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    // 默认的初始数据
    score: 0,  // 目前得分
    maxscore: 0,  // 最高得分
    startx: 0,  // 手指tapStart的开始X轴坐标
    starty: 0,  // 手指tapStart的开始Y轴坐标
    endx: 0,  // 手指tapEnd的开始X轴坐标
    endy: 0,  // 手指tapEnd的开始Y轴坐标
    direction: '',  // 手指滑动方向
    numbers: [[0, 0, 2, 0], [0, 0, 4, 0], [0, 0, 0, 0], [0, 0, 0, 0]],  // 初始化坐标
    modalHidden: true,  // 重启或失败时的提示开关
  },
  onLoad: function () {
    //调用API从本地缓存中获取数据
    var maxscore = wx.getStorageSync('maxscore');
    // 初始话时设置最高分
    if (!maxscore) maxscore = 0;
    this.setData({
      maxscore: maxscore
    });
  },
  // 下拉刷新页面
  // onPullDownRefresh: function () {
  //   this.mergebottom();
  //   wx.stopPullDownRefresh();
  // },
  // 设置得分并保存到本地storage
  storeScore: function () {
    console.log(this.data.maxscore, this.data.score)
    if (this.data.maxscore < this.data.score) {
      this.setData({
        maxscore: this.data.score
      })
      wx.setStorageSync('maxscore', this.data.maxscore);
    }
  },
  // 重启游戏
  restart: function () {
    this.setData({
      modalHidden: false
    })
  },
  // 按下时记录开始位置的坐标
  tapStart: function (event) {
    this.setData({
      startx: event.touches[0].pageX,
      starty: event.touches[0].pageY
    })
  },
  // 移动停止位置的坐标
  tapMove: function (event) {
    this.setData({
      endx: event.touches[0].pageX,
      endy: event.touches[0].pageY
    })
  },
  // 计算移动距离
  tapEnd: function (event) {
    var heng = (this.data.endx) ? (this.data.endx - this.data.startx) : 0;
    var shu = (this.data.endy) ? (this.data.endy - this.data.starty) : 0;
    console.log(heng, shu);
    if (Math.abs(heng) > 5 || Math.abs(shu) > 5) {
      var direction = (Math.abs(heng) > Math.abs(shu)) ? this.computeDir(1, heng) : this.computeDir(0, shu);
      this.setData({
        startx: 0,
        starty: 0,
        endx: 0,
        endy: 0
      });
      this.mergeAll(direction) && this.randInsert(); // 某方向移动并新增一个数字
    }
  },
  // 计算移动方向（形参1代表左右方向0代表上下方向）
  computeDir: function (leftOrRight, num) {
    if (leftOrRight) return (num > 0) ? 'right' : 'left';
    return (num > 0) ? 'bottom' : 'top';
  },
  // 要往哪个方向移动方块
  mergeAll: function (dir) {
    this.checkGame();  // 检查游戏是否失败（全部占满，不能移动了）
    switch (dir) {
      case 'left':
        return this.mergeleft();
        break;
      case 'right':
        return this.mergeright();
        break;
      case 'top':
        return this.mergetop();
        break;
      case 'bottom':
        return this.mergebottom();
        break;
      default:
    }
  },

  // 向左移动
  mergeleft: function () {
    var change = false;
    var arr = this.data.numbers;  // 初始坐标

    for (var i = 0; i < 4; i++) {
      //merge first 判断是否可以合并
      for (var j = 0; j < 3; j++) {
        if (arr[i][j] == 0) continue;
        for (var k = 1; k < 4 - j; k++) {
          if (arr[i][j] != 0 && arr[i][j + k] != 0) {
            if (arr[i][j] != arr[i][j + k]) break;   //不相同则直接跳过
            arr[i][j] = arr[i][j] * 2;  // 否则合并
            arr[i][j + k] = 0;
            change = true;
            if (this.data.score < arr[i][j]) {
              this.setData({ score: arr[i][j] })
            }
            break;
          }
        }
      }
      //movemove  然后再移动
      for (var j = 0; j < 3; j++) {
        if (arr[i][j] == 0) {
          for (var k = 1; k < 4 - j; k++) {
            if (arr[i][j + k] != 0) {
              arr[i][j] = arr[i][j + k];
              arr[i][j + k] = 0;
              change = true;
              break;
            }
          }
        }
      }
    };
    // 设置新的坐标系
    this.setData({
      numbers: arr
    });
    // 得分存到storage
    this.storeScore();
    // return change;
  },
  // 向右移动
  mergeright: function () {
    var change = false
    var arr = this.data.numbers;

    for (var i = 0; i < 4; i++) {
      //merge first
      for (var j = 3; j > 0; j--) {
        if (arr[i][j] == 0) continue;
        for (var k = 1; k <= j; k++) {
          if (arr[i][j] != 0 && arr[i][j - k] != 0) {
            if (arr[i][j] != arr[i][j - k]) break;
            arr[i][j] = arr[i][j] * 2;
            arr[i][j - k] = 0;
            change = true;
            if (this.data.score < arr[i][j]) {
              this.setData({ score: arr[i][j] })
            }
            break;
          }
        }
      }
      //movemove
      for (var j = 3; j > 0; j--) {
        if (arr[i][j] == 0) {
          for (var k = 1; k <= j; k++) {
            if (arr[i][j - k] != 0) {
              arr[i][j] = arr[i][j - k];
              arr[i][j - k] = 0;
              change = true;
              break;
            }
          }
        }
      }
    };
    this.setData({
      numbers: arr
    });
    this.storeScore();
    return change;
  },
  // 向下移动
  mergebottom: function () {
    var change = false;
    var arr = this.data.numbers;

    for (var i = 0; i < 4; i++) {
      //merge first
      for (var j = 3; j > 0; j--) {
        if (arr[j][i] == 0) continue;
        for (var k = 1; k <= j; k++) {
          if (arr[j][i] != 0 && arr[j - k][i] != 0) {
            if (arr[j][i] != arr[j - k][i]) break;
            arr[j][i] = arr[j][i] * 2;
            arr[j - k][i] = 0;
            change = true;
            if (this.data.score < arr[j][i]) {
              this.setData({ score: arr[j][i] })
            }
            break;
          }
        }
      }
      //movemove
      for (var j = 3; j > 0; j--) {
        if (arr[j][i] == 0) {
          for (var k = 1; k <= j; k++) {
            if (arr[j - k][i] != 0) {
              arr[j][i] = arr[j - k][i];
              arr[j - k][i] = 0;
              change = true
              break;
            }
          }
        }
      }
    }
    this.setData({
      numbers: arr
    });
    this.storeScore();
    return change;
  },
  // 向上移动
  mergetop: function () {
    var change = false;
    var arr = this.data.numbers;

    for (var i = 0; i < 4; i++) {
      //merge first
      for (var j = 0; j < 3; j++) {
        if (arr[j][i] == 0) continue;
        for (var k = 1; k < 4 - j; k++) {
          if (arr[j][i] != 0 && arr[j + k][i] != 0) {
            if (arr[j][i] != arr[j + k][i]) break;
            arr[j][i] = arr[j][i] * 2;
            arr[j + k][i] = 0;
            change = true;
            if (this.data.score < arr[j][i]) {
              this.setData({ score: arr[j][i] })
            }
            break;
          }
        }
      }
      //movemove
      for (var j = 0; j < 3; j++) {
        if (arr[j][i] == 0) {
          for (var k = 1; k < 4 - j; k++) {
            if (arr[j + k][i] != 0) {
              arr[j][i] = arr[j + k][i];
              arr[j + k][i] = 0;
              change = true;
              break;
            }
          }
        }
      }
    }
    this.setData({
      numbers: arr
    });
    this.storeScore();
    return change;
  },
  //随机插入
  randInsert: function () {
    var arr = this.data.numbers;
    //随机2或4
    var num = Math.random() < 0.75 ? 2 : 4;
    //计算随机位置
    var zeros = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (arr[i][j] == 0) {
          zeros.push([i, j]);
        }
      }
    }
    var position = zeros[Math.floor(Math.random() * zeros.length)];
    arr[position[0]][position[1]] = num;
    this.setData({
      numbers: arr
    });
  },
  // 检查游戏是否失败
  checkGame: function () {
    var arr = this.data.numbers
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (arr[i][j] == 0) return;
      }
    }
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        if (arr[i][j] == arr[i + 1][j] || arr[i][j] == arr[i][j + 1]) return;
      }
    }

    for (var j = 0; j < 3; j++) {
      if (arr[3][j] == arr[3][j + 1]) return;
      if (arr[j][3] == arr[j + 1][3]) return;
    }
    this.setData({
      modalHidden: false,
    })
  },
  // 重启时的确定按钮
  modalChange: function () {
    this.setData({
      score: 0,
      numbers: [[0, 0, 2, 0], [0, 0, 4, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      modalHidden: true,
    })
  },
  // 重启时的取消按钮
  modalCancle: function () {
    this.setData({
      modalHidden: true,
    })
  },
})
