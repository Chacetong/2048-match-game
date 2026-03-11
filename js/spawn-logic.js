/**
 * 棋子生成逻辑模块
 * 
 * 棋盘直接存储等级（Level），无需数值转换
 */

// ==================== 可配置区域 ====================

/**
 * 生成规则配置
 * 按优先级排序，第一条匹配的规则生效
 */
const SPAWN_RULES = [
    {
        name: "阶段 4 (Lv.4/Lv.5)",
        condition: (maxLv, minLv) => maxLv >= 12 && minLv >= 4,
        levels: [4, 5],
        weights: [2, 1]
    },
    {
        name: "阶段 3 (Lv.3/Lv.4)",
        condition: (maxLv, minLv) => maxLv >= 11 && minLv >= 3,
        levels: [3, 4],
        weights: [2, 1]
    },
    {
        name: "阶段 2 (Lv.2/Lv.3)",
        condition: (maxLv, minLv) => maxLv >= 10 && minLv >= 2,
        levels: [2, 3],
        weights: [2, 1]
    },
    {
        name: "阶段 1 (Lv.1/Lv.2)",
        condition: () => true,
        levels: [1, 2],
        weights: [2, 1]
    }
];

// ==================== 核心逻辑 ====================

/**
 * 获取盘面最大等级
 */
function getMaxLevel() {
    let max = 0;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] > max) max = board[r][c];
        }
    }
    return max;
}

/**
 * 获取盘面最小非零等级
 */
function getMinLevel() {
    let min = Infinity;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const lv = board[r][c];
            if (lv !== 0 && lv < min) min = lv;
        }
    }
    return min === Infinity ? 0 : min;
}

/**
 * 加权随机选择
 */
function weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return i;
    }
    return weights.length - 1;
}

/**
 * 匹配生成规则
 */
function matchRule() {
    const maxLv = getMaxLevel();
    const minLv = getMinLevel();
    for (const rule of SPAWN_RULES) {
        if (rule.condition(maxLv, minLv)) return rule;
    }
    return SPAWN_RULES[SPAWN_RULES.length - 1];
}

/**
 * 获取新棋子等级
 */
function getNewTileLevel() {
    const rule = matchRule();
    const idx = weightedRandom(rule.weights);
    return rule.levels[idx];
}

/**
 * 调试信息
 */
function getSpawnInfo() {
    const rule = matchRule();
    const total = rule.weights.reduce((a, b) => a + b, 0);
    return {
        maxLv: getMaxLevel(),
        minLv: getMinLevel(),
        rule: rule.name,
        options: rule.levels.map((lv, i) => ({
            level: lv,
            prob: Math.round(rule.weights[i] / total * 100) + '%'
        }))
    };
}

// 导出
if (typeof window !== 'undefined') {
    window.SPAWN_RULES = SPAWN_RULES;
    window.getNewTileLevel = getNewTileLevel;
    window.getMaxLevel = getMaxLevel;
    window.getMinLevel = getMinLevel;
    window.getSpawnInfo = getSpawnInfo;
}
