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

// 升级道具
let isUpgradeMode = false;
let upgradeCount = 2;

// Cycle 系统 (lv13 触发循环)
let cycleLevel = 0;  // 当前 cycle 层级，0=初始(set-01), 1=set-02, 2=set-03...
const MAX_PATTERN_SET = 5;  // 最大 pattern set 数量 (set-01 到 set-05)
const CYCLE_TRIGGER_LEVEL = 13;  // 触发 cycle 的等级

// 展示模块 - 记录用户达到过的最高等级
let maxLevelReached = 0;  // 本局游戏达到过的最高等级
