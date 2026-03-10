/**
 * 游戏状态管理模块
 * 包含所有游戏相关的状态变量
 */

// 游戏核心状态
let board = [];
let score = 0;
let bestScore = 0;  // 只在单次会话保留，不存 localStorage
let hasWon = false;

// 触摸控制状态
let touchStartX = 0;
let touchStartY = 0;

// 动画状态
let isAnimating = false;

// 撤销功能状态
let historyStack = [];  // 历史记录栈，保存多步状态 [{board: [...], score: number}, ...]

// 交换道具状态
let isSwitchMode = false;  // 是否处于交换模式
let selectedCell = null;   // 选中的第一个棋子 {r, c}
let switchCount = 2;       // 交换道具剩余使用次数（每局初始2次）
