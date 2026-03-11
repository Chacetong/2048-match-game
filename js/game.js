/**
 * 核心游戏逻辑模块
 */

// 注意: CYCLE_TRIGGER_LEVEL 和 MAX_PATTERN_SET 定义在 state.js 中

const DIFFICULTY_SIZES = {
    'Easy': 5,
    'Normal': 4,
    'Hard': 3
};

/**
 * 开始游戏
 * @param {string} difficulty - 'Easy', 'Normal', 'Hard'
 */
function startGame(difficulty) {
    currentDifficulty = difficulty;
    gridSize = DIFFICULTY_SIZES[difficulty];
    
    // 加载该难度的最高分
    bestScore = loadBestScore(difficulty);
    
    // 切换页面
    document.getElementById('start-page').classList.add('hidden');
    document.getElementById('game-page').classList.remove('hidden');
    
    // 初始化游戏
    init();
}

/**
 * 返回主菜单
 */
function quitToMenu() {
    // 隐藏弹窗
    document.getElementById('restart-confirm').classList.remove('show');
    
    // 重置游戏状态
    board = [];
    score = 0;
    hasWon = false;
    hasSuperWon = false;
    cycleLevel = 0;
    historyStack = [];
    isSwitchMode = false;
    selectedCell = null;
    isUpgradeMode = false;
    
    // 切换回启动页
    document.getElementById('game-page').classList.add('hidden');
    document.getElementById('start-page').classList.remove('hidden');
}

/**
 * 加载指定难度的最高分
 */
function loadBestScore(difficulty) {
    const key = `tilefuse_best_${difficulty}`;
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved, 10) : 0;
}

/**
 * 保存最高分
 */
function saveBestScore() {
    if (score > bestScore) {
        bestScore = score;
        const key = `tilefuse_best_${currentDifficulty}`;
        localStorage.setItem(key, bestScore);
    }
}

// 初始化
function init() {
    createGridDOM();
    board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    score = 0;
    hasWon = false;
    hasSuperWon = false;
    cycleLevel = 0;
    maxLevelReached = 0;  // 重置达到过的最高等级
    currentPatternSet = '01';  // 重置 pattern set
    historyStack = [];
    switchCount = 2;
    upgradeCount = 2;
    exitSwitchMode();
    exitUpgradeMode();
    updateScore();
    updateUndoButton();
    hideOverlays();
    addNewTile();
    addNewTile();
    
    // 确保 maxLevelReached 正确设置为当前棋盘最高等级
    //（addNewTile 中也会更新，但这里双重确认）
    let currentMax = 0;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] > currentMax) {
                currentMax = board[r][c];
            }
        }
    }
    maxLevelReached = currentMax;
    
    updateSwitchButton();
    updateUpgradeButton();
    render();
}

function newGame() {
    // 先隐藏所有弹窗
    document.getElementById('game-won').classList.remove('show');
    document.getElementById('game-super-won').classList.remove('show');
    document.getElementById('game-over').classList.remove('show');
    
    saveBestScore();
    init();
}

function continueGame() {
    document.getElementById('game-won').classList.remove('show');
}

function continueSuperGame() {
    document.getElementById('game-super-won').classList.remove('show');
}

/**
 * 将棋子等级映射到 1-4
 * 根据当前等级分布进行合理映射
 */
function mapTilesToLowLevels() {
    // 获取所有非空棋子的等级
    const levels = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) {
                levels.push(board[r][c]);
            }
        }
    }
    
    if (levels.length === 0) return;
    
    // 按等级排序
    levels.sort((a, b) => a - b);
    
    // 计算分位数，将等级分为 4 组映射到 1-4
    const minLv = levels[0];
    const maxLv = levels[levels.length - 1];
    const range = maxLv - minLv;
    
    // 映射函数：根据等级在范围中的位置映射到 1-4
    function getMappedLevel(originalLevel) {
        if (range === 0) return 2;  // 如果所有等级相同，映射到 2
        const ratio = (originalLevel - minLv) / range;
        if (ratio < 0.25) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 0.75) return 3;
        return 4;
    }
    
    // 应用映射到棋盘
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) {
                board[r][c] = getMappedLevel(board[r][c]);
            }
        }
    }
}

/**
 * 进入下一个 Cycle
 * 1. 映射棋子等级到 1-4
 * 2. 切换到下一个 pattern set
 * 3. 如果没有下一个 set，触发 game-super-won
 */
function continueCycle() {
    document.getElementById('game-won').classList.remove('show');
    hasWon = false;
    
    // 1. 映射棋子等级
    mapTilesToLowLevels();
    
    // 2. 切换到下一个 pattern set
    cycleLevel++;
    
    if (cycleLevel >= MAX_PATTERN_SET) {
        // 没有更多的 set，触发传奇胜利
        hasSuperWon = true;
        setTimeout(() => {
            document.getElementById('game-super-won').classList.add('show');
        }, 300);
        render();
        return;
    }
    
    // 切换到下一个 set (01 -> 02 -> 03)
    currentPatternSet = String(cycleLevel + 1).padStart(2, '0');
    
    // 重置道具次数
    switchCount = 2;
    upgradeCount = 2;
    
    // 重置 maxLevelReached 为映射后的最高等级
    maxLevelReached = 0;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] > maxLevelReached) {
                maxLevelReached = board[r][c];
            }
        }
    }
    
    // 清空历史栈（防止撤销到 cycle 之前的状态）
    historyStack = [];
    updateUndoButton();
    updateSwitchButton();
    updateUpgradeButton();
    
    // 重新渲染
    render();
    
    // 显示切换提示
    showToast(`进入 Cycle ${cycleLevel + 1}！Pattern 已切换`);
}

// 移动棋子
function move(direction) {
    if (isAnimating) return;

    if (isSwitchMode) exitSwitchMode();
    if (isUpgradeMode) exitUpgradeMode();

    historyStack.push({
        board: board.map(row => [...row]),
        score: score
    });

    const preRects = {};
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) {
                preRects[`${r}-${c}`] = document.getElementById(`cell-${r}-${c}`).getBoundingClientRect();
            }
        }
    }

    let moved = false;
    const mergedPositions = [];
    const tileMovements = {};

    function slideRow(row, rowIdx, isCol = false, colIdx = 0) {
        const orig = [...row];
        const nonZero = [];
        for (let i = 0; i < gridSize; i++) {
            if (row[i] !== 0) nonZero.push({ lv: row[i], idx: i });
        }

        const items = [];
        let i = 0;
        while (i < nonZero.length) {
            if (i + 1 < nonZero.length && nonZero[i].lv === nonZero[i + 1].lv) {
                const newLv = nonZero[i].lv + 1;
                score += getMergeScore(newLv);
                
                // 更新达到过的最高等级
                if (newLv > maxLevelReached) {
                    maxLevelReached = newLv;
                }
                
                // 检测是否达到 Cycle 触发等级 (lv13)
                if (newLv === CYCLE_TRIGGER_LEVEL && !hasWon && !hasSuperWon) {
                    hasWon = true;
                    setTimeout(() => document.getElementById('game-won').classList.add('show'), 200);
                }
                
                items.push({
                    lv: newLv,
                    merged: true,
                    fromIdx: [nonZero[i].idx, nonZero[i + 1].idx]
                });
                i += 2;
            } else {
                items.push({
                    lv: nonZero[i].lv,
                    merged: false,
                    fromIdx: [nonZero[i].idx]
                });
                i++;
            }
        }

        const result = Array(gridSize).fill(0);
        for (let j = 0; j < items.length; j++) {
            result[j] = items[j].lv;
            items[j].fromIdx.forEach(from => {
                const fr = isCol ? from : rowIdx;
                const fc = isCol ? colIdx : from;
                const tr = isCol ? j : rowIdx;
                const tc = isCol ? colIdx : j;
                tileMovements[`${tr}-${tc}`] = { fr, fc };
            });
            if (items[j].merged) {
                const fromLv = items[j].lv - 1;
                if (isCol) mergedPositions.push({ r: j, c: colIdx, fromLv });
                else mergedPositions.push({ r: rowIdx, c: j, fromLv });
            }
        }

        return { result, changed: JSON.stringify(result) !== JSON.stringify(orig) };
    }

    if (direction === 'left') {
        for (let r = 0; r < gridSize; r++) {
            const { result, changed } = slideRow(board[r], r);
            if (changed) { moved = true; board[r] = result; }
        }
    } else if (direction === 'right') {
        for (let r = 0; r < gridSize; r++) {
            const rev = [...board[r]].reverse();
            const { result, changed } = slideRow(rev, r);
            if (changed) {
                moved = true;
                board[r] = [...result].reverse();
                Object.keys(tileMovements).filter(k => k.startsWith(`${r}-`)).forEach(k => {
                    const [, c] = k.split('-').map(Number);
                    const m = tileMovements[k];
                    if (m.fr === r) m.fc = (gridSize - 1) - m.fc;
                    tileMovements[`${r}-${(gridSize - 1) - c}`] = m;
                    delete tileMovements[k];
                });
                mergedPositions.forEach(p => { if (p.r === r) p.c = (gridSize - 1) - p.c; });
            }
        }
    } else if (direction === 'up') {
        for (let c = 0; c < gridSize; c++) {
            const col = [];
            for (let r = 0; r < gridSize; r++) col.push(board[r][c]);
            const { result, changed } = slideRow(col, 0, true, c);
            if (changed) {
                moved = true;
                for (let r = 0; r < gridSize; r++) board[r][c] = result[r];
            }
        }
    } else if (direction === 'down') {
        for (let c = 0; c < gridSize; c++) {
            const col = [];
            for (let r = 0; r < gridSize; r++) col.push(board[r][c]);
            const { result, changed } = slideRow([...col].reverse(), 0, true, c);
            if (changed) {
                moved = true;
                const final = [...result].reverse();
                for (let r = 0; r < gridSize; r++) board[r][c] = final[r];
                Object.keys(tileMovements).filter(k => k.endsWith(`-${c}`)).forEach(k => {
                    const [r] = k.split('-').map(Number);
                    const m = tileMovements[k];
                    if (m.fc === c) m.fr = (gridSize - 1) - m.fr;
                    tileMovements[`${(gridSize - 1) - r}-${c}`] = m;
                    delete tileMovements[k];
                });
                mergedPositions.forEach(p => { if (p.c === c) p.r = (gridSize - 1) - p.r; });
            }
        }
    }

    if (!moved) {
        historyStack.pop();
        return;
    }

    updateUndoButton();
    isAnimating = true;
    updateScore();

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const merged = mergedPositions.find(p => p.r === r && p.c === c);
            renderTile(cell, merged ? merged.fromLv : board[r][c], false, false);
        }
    }

    requestAnimationFrame(() => {
        for (const [key, { fr, fc }] of Object.entries(tileMovements)) {
            const [tr, tc] = key.split('-').map(Number);
            const toCell = document.getElementById(`cell-${tr}-${tc}`);
            if (!toCell.classList.contains('is-tile')) continue;
            
            const fromRect = preRects[`${fr}-${fc}`];
            if (!fromRect) continue;
            
            const toRect = toCell.getBoundingClientRect();
            const dx = fromRect.left - toRect.left;
            const dy = fromRect.top - toRect.top;
            
            if (dx === 0 && dy === 0) continue;
            
            toCell.style.transition = 'none';
            toCell.style.transform = `translate(${dx}px, ${dy}px)`;
            
            requestAnimationFrame(() => {
                toCell.style.transition = 'transform 200ms ease-out';
                toCell.style.transform = 'translate(0, 0)';
            });
        }

        setTimeout(() => {
            const keys = new Set([
                ...Object.keys(tileMovements),
                ...mergedPositions.map(p => `${p.r}-${p.c}`)
            ]);
            for (const key of keys) {
                const [r, c] = key.split('-').map(Number);
                const cell = document.getElementById(`cell-${r}-${c}`);
                if (cell) {
                    cell.style.transition = 'none';
                    cell.style.transform = '';
                    void cell.offsetHeight;
                    cell.style.transition = '';
                }
            }

            const newTile = addNewTile();
            if (newTile) updateCell(newTile.r, newTile.c, true, false);
            mergedPositions.forEach(p => updateCell(p.r, p.c, false, true));

            if (isGameOver()) {
                saveBestScore();
                setTimeout(() => document.getElementById('game-over').classList.add('show'), 300);
            }

            isAnimating = false;
            updateSwitchButton();
            updateUpgradeButton();
            updateTileShowcase();  // 更新展示模块
        }, 210);
    });
}

// ============================================
// 棋子展示模块
// ============================================

/**
 * 更新棋子展示模块
 * 显示当前 set 的所有棋子（使用 overlay set-xx 切图）
 * 已达成的显示彩色，未达成的显示灰褐色
 */
function updateTileShowcase() {
    const showcaseContainer = document.getElementById('showcase-tiles');
    if (!showcaseContainer) return;
    
    // 调试日志
    console.log('updateTileShowcase - maxLevelReached:', maxLevelReached);
    
    // 清空容器
    showcaseContainer.innerHTML = '';
    
    // 生成 1-12 级的棋子展示
    for (let lv = 1; lv <= 12; lv++) {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'showcase-tile';
        
        // 根据是否达成添加不同样式（使用 maxLevelReached 判断历史最高）
        if (lv <= maxLevelReached) {
            tileDiv.classList.add('unlocked');
            if (lv === maxLevelReached) {
                tileDiv.classList.add('current-max');
            }
        } else {
            tileDiv.classList.add('locked');
        }
        
        // 创建棋子图片 - 使用 overlay set-xx 的切图
        const img = document.createElement('img');
        // 直接使用 pattern 切图路径
        const patternImage = tileStyles.getPatternImage(lv);
        img.src = patternImage;
        img.alt = `Lv.${lv}`;
        
        tileDiv.appendChild(img);
        showcaseContainer.appendChild(tileDiv);
    }
}

// ============================================
// 调试命令 (浏览器控制台使用)
// ============================================

/**
 * 将所有棋子等级 +1
 * 控制台命令: levelUpAll()
 */
function levelUpAll() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) {
                board[r][c]++;
            }
        }
    }
    render();
    updateSwitchButton();
    updateUpgradeButton();
    console.log('✅ 所有棋子等级 +1');
    console.log('当前棋盘:', board.map(row => row.filter(n => n !== 0)));
}

/**
 * 将所有棋子等级 -1 (最低为 1)
 * 控制台命令: levelDownAll()
 */
function levelDownAll() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] > 1) {
                board[r][c]--;
            }
        }
    }
    render();
    updateSwitchButton();
    updateUpgradeButton();
    console.log('✅ 所有棋子等级 -1');
    console.log('当前棋盘:', board.map(row => row.filter(n => n !== 0)));
}

/**
 * 设置指定位置的棋子等级
 * 控制台命令: setTile(0, 0, 12) // 将第0行第0列设为lv12
 */
function setTile(r, c, level) {
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
        console.error('❌ 位置超出棋盘范围');
        return;
    }
    if (level < 0 || level > 20) {
        console.error('❌ 等级范围 0-20');
        return;
    }
    board[r][c] = level;
    render();
    updateSwitchButton();
    updateUpgradeButton();
    console.log(`✅ 设置棋子 [${r},${c}] = Lv.${level}`);
}

/**
 * 查看当前棋盘状态
 * 控制台命令: showBoard()
 */
function showBoard() {
    console.log('当前棋盘等级:');
    for (let r = 0; r < gridSize; r++) {
        const row = board[r].map(lv => lv === 0 ? '·' : String(lv).padStart(2, '0')).join(' ');
        console.log(`  第${r}行: ${row}`);
    }
    console.log(`Cycle Level: ${cycleLevel}, Pattern Set: ${currentPatternSet}`);
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.levelUpAll = levelUpAll;
    window.levelDownAll = levelDownAll;
    window.setTile = setTile;
    window.showBoard = showBoard;
    
    // 打印帮助信息
    console.log('%c🎮 TileFuse 调试命令已加载', 'color: #579b62; font-size: 14px; font-weight: bold;');
    console.log('%c可用命令:', 'color: #8b7e6a;');
    console.log('  levelUpAll()   - 所有棋子等级 +1');
    console.log('  levelDownAll() - 所有棋子等级 -1');
    console.log('  setTile(r,c,l) - 设置指定位置棋子等级');
    console.log('  showBoard()    - 显示当前棋盘状态');
}
