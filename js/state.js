/**
 * 游戏状态管理模块
 */

// 游戏状态
let board = [];              // 棋盘 (存储等级)
let score = 0;               // 当前分数
let bestScore = 0;           // 当前难度的最高分
let currentDifficulty = '';  // 当前难度: 'Easy', 'Normal', 'Hard'
let hasWon = false;          // 是否达成 Lv.11
let hasSuperWon = false;     // 是否达成 Lv.12

// 触摸控制
let touchStartX = 0;
let touchStartY = 0;

// 动画
let isAnimating = false;

// 撤销
let historyStack = [];

// 交换道具
let isSwitchMode = false;
let selectedCell = null;
let switchCount = 2;
