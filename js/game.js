/**
 * 核心游戏逻辑模块
 */

const WIN_LEVEL = 11;
const SUPER_LEVEL = 12;

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
    updateSwitchButton();
    updateUpgradeButton();
    render();
}

function newGame() {
    saveBestScore();
    init();
}

function continueGame() {
    document.getElementById('game-won').classList.remove('show');
}

function continueSuperGame() {
    document.getElementById('game-super-won').classList.remove('show');
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
                
                if (newLv === WIN_LEVEL && !hasWon) {
                    hasWon = true;
                    setTimeout(() => document.getElementById('game-won').classList.add('show'), 200);
                }
                if (newLv === SUPER_LEVEL && !hasSuperWon) {
                    hasSuperWon = true;
                    setTimeout(() => document.getElementById('game-super-won').classList.add('show'), 300);
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
        }, 210);
    });
}
