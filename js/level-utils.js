/**
 * 等级工具函数模块
 * 
 * 核心概念：
 * - 棋子以等级（Level）存储：0(空), 1, 2, 3, 4...
 * - 显示文本：Lv.1, Lv.2, Lv.3...
 * - 合并规则：相同等级合并为 level + 1
 */

/**
 * 获取等级显示文本
 * @param {number} level - 等级
 * @returns {string} 显示文本 (如 "Lv.1", "Lv.10")
 */
function getLevelText(level) {
    if (level === 0) return '';
    return `Lv.${level}`;
}

/**
 * 获取等级对应的 CSS 类名
 * @param {number} level - 等级
 * @returns {string} CSS 类名 (如 "tile-lv1")
 */
function getTileClass(level) {
    if (level === 0) return '';
    return `tile-lv${level}`;
}

/**
 * 计算合并后的等级
 * @param {number} levelA - 第一个棋子等级
 * @param {number} levelB - 第二个棋子等级
 * @returns {number} 合并后的等级（相同则+1，不同取最大）
 */
function getMergedLevel(levelA, levelB) {
    if (levelA === levelB && levelA > 0) {
        return levelA + 1;
    }
    return Math.max(levelA, levelB);
}

/**
 * 计算合并得分
 * @param {number} newLevel - 合并后的新等级
 * @returns {number} 得分
 */
function getMergeScore(newLevel) {
    // 得分 = 2^newLevel，即升级后的数值概念
    return Math.pow(2, newLevel);
}

// 导出函数
if (typeof window !== 'undefined') {
    window.getLevelText = getLevelText;
    window.getTileClass = getTileClass;
    window.getMergedLevel = getMergedLevel;
    window.getMergeScore = getMergeScore;
}
