/**
 * 升级道具模块
 * 提升一个非当前最高等级棋子的等级
 */

/**
 * 获取当前棋盘上的最高等级
 * @returns {number} 最高等级
 */
function getCurrentMaxLevel() {
    let maxLevel = 0;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] > maxLevel) {
                maxLevel = board[r][c];
            }
        }
    }
    return maxLevel;
}

/**
 * 检查升级道具是否可用
 * 需要：
 * 1. 道具次数 > 0
 * 2. 棋盘上至少有一个非最高等级的棋子
 */
function isUpgradeAvailable() {
    if (upgradeCount <= 0) return false;

    const maxLevel = getCurrentMaxLevel();
    // 如果棋盘上没有棋子或最高等级为1，无法使用
    if (maxLevel <= 1) return false;

    // 检查是否有非最高等级的棋子
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0 && board[r][c] < maxLevel) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 更新升级按钮状态
 */
function updateUpgradeButton() {
    const propItem = document.getElementById('prop-upgrade');
    const propImg = document.getElementById('prop-upgrade-img');
    const countBadge = document.getElementById('prop-upgrade-count');
    const countText = countBadge.querySelector('.prop-count-text');
    const countBg = countBadge.querySelector('.prop-count-bg');
    const available = isUpgradeAvailable();

    countText.textContent = upgradeCount;

    if (available) {
        propItem.classList.remove('disabled');
        propImg.src = 'Assets/props/upgrade-active.png';
        countBg.src = 'Assets/props/badge-active.png';
    } else {
        propItem.classList.add('disabled');
        propImg.src = 'Assets/props/upgrade-disabled.png';
        if (upgradeCount <= 0) countBg.src = 'Assets/props/badge-disabled.png';
        if (isUpgradeMode) exitUpgradeMode();
    }
}

/**
 * 切换升级模式
 */
function toggleUpgradeMode() {
    if (isAnimating || !isUpgradeAvailable()) return;
    
    // 如果当前已激活，则退出
    if (isUpgradeMode) {
        exitUpgradeMode();
        return;
    }
    
    // 如果 Switch 处于激活状态，先退出 Switch
    if (typeof isSwitchMode !== 'undefined' && isSwitchMode) {
        exitSwitchMode();
    }
    
    enterUpgradeMode();
}

/**
 * 进入升级模式
 */
function enterUpgradeMode() {
    isUpgradeMode = true;
    document.getElementById('prop-upgrade').classList.add('active');
    highlightMaxLevelTiles();
    attachUpgradeClickHandlers();
    showToast('点击一个非最高等级的棋子进行升级');
}

/**
 * 退出升级模式
 */
function exitUpgradeMode() {
    isUpgradeMode = false;
    document.getElementById('prop-upgrade').classList.remove('active');
    removeMaxLevelTileHighlight();
    detachUpgradeClickHandlers();
}

/**
 * 附加升级点击处理器到所有非空棋子
 */
function attachUpgradeClickHandlers() {
    const maxLevel = getCurrentMaxLevel();
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                cell.dataset.upgradeClick = 'true';
                cell.onclick = () => handleUpgradeClick(r, c, maxLevel);
            }
        }
    }
}

/**
 * 移除升级点击处理器
 */
function detachUpgradeClickHandlers() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            cell.dataset.upgradeClick = '';
            cell.onclick = null;
        }
    }
}

/**
 * 高亮显示最高等级的棋子（降低透明度表示不可用）
 */
function highlightMaxLevelTiles() {
    const maxLevel = getCurrentMaxLevel();
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] === maxLevel && board[r][c] !== 0) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                cell.classList.add('upgrade-disabled-tile');
            }
        }
    }
}

/**
 * 移除最高等级棋子的高亮
 */
function removeMaxLevelTileHighlight() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            cell.classList.remove('upgrade-disabled-tile');
        }
    }
}

/**
 * 处理升级点击
 * @param {number} r - 行索引
 * @param {number} c - 列索引
 * @param {number} maxLevel - 当前最高等级
 */
function handleUpgradeClick(r, c, maxLevel) {
    if (!isUpgradeMode || isAnimating || board[r][c] === 0) return;

    const clickedLevel = board[r][c];

    // 检查是否点击了最高等级棋子
    if (clickedLevel >= maxLevel) {
        showToast('不能升级最高等级的棋子');
        return;
    }

    // 执行升级
    upgradeTile(r, c);
    exitUpgradeMode();
}

/**
 * 升级指定位置的棋子
 * @param {number} r - 行索引
 * @param {number} c - 列索引
 */
function upgradeTile(r, c) {
    isAnimating = true;

    // 保存历史状态用于撤销
    historyStack.push({
        board: board.map(row => [...row]),
        score: score
    });
    updateUndoButton();

    const cell = document.getElementById(`cell-${r}-${c}`);
    const oldLevel = board[r][c];
    const newLevel = oldLevel + 1;

    // 更新棋盘数据
    board[r][c] = newLevel;

    // 播放升级动画
    cell.classList.add('tile-upgrade');

    // 扣除道具次数
    upgradeCount--;

    // 增加得分（相当于合并得分）
    score += getMergeScore(newLevel);
    updateScore();

    // 检查是否达成胜利条件
    if (newLevel === WIN_LEVEL && !hasWon) {
        hasWon = true;
        setTimeout(() => document.getElementById('game-won').classList.add('show'), 200);
    }
    if (newLevel === SUPER_LEVEL && !hasSuperWon) {
        hasSuperWon = true;
        setTimeout(() => document.getElementById('game-super-won').classList.add('show'), 300);
    }

    setTimeout(() => {
        render();
        updateUpgradeButton();
        cell.classList.remove('tile-upgrade');
        isAnimating = false;

        // 检查游戏结束
        if (isGameOver()) {
            saveBestScore();
            setTimeout(() => document.getElementById('game-over').classList.add('show'), 300);
        }
    }, 300);
}

// 导出函数
if (typeof window !== 'undefined') {
    window.toggleUpgradeMode = toggleUpgradeMode;
    window.updateUpgradeButton = updateUpgradeButton;
    window.exitUpgradeMode = exitUpgradeMode;
}
