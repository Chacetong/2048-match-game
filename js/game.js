/**
 * 核心游戏逻辑模块
 * 包含移动、合并、游戏初始化等功能
 */

// 游戏初始化
function init() {
    // 创建网格 DOM
    createGridDOM();
    // 初始化游戏状态
    board = Array(4).fill(null).map(() => Array(4).fill(0));
    score = 0;
    hasWon = false;
    hasSuperWon = false;  // 重置隐藏结局状态
    historyStack = [];  // 重置历史栈
    switchCount = 2;  // 重置交换道具次数
    exitSwitchMode();  // 重置交换模式
    updateScore();
    updateUndoButton();  // 更新撤销按钮状态
    hideOverlays();
    addNewTile();
    addNewTile();
    updateSwitchButton();  // 更新交换按钮状态
    render();
}

// 新游戏
function newGame() {
    init();
}

// 继续游戏（2048 获胜后）
function continueGame() {
    document.getElementById('game-won').classList.remove('show');
}

// 继续游戏（4096 隐藏结局后）
function continueSuperGame() {
    document.getElementById('game-super-won').classList.remove('show');
}

// 移动棋子
function move(direction) {
    if (isAnimating) return;

    // 如果处于交换模式，先退出
    if (isSwitchMode) {
        exitSwitchMode();
    }

    // 保存当前状态到历史（用于撤销）
    const previousState = {
        board: board.map(row => [...row]),
        score: score
    };

    // 快照：记录移动前每个非空格子的像素位置
    const preRects = {};
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] !== 0) {
                preRects[`${r}-${c}`] = document.getElementById(`cell-${r}-${c}`).getBoundingClientRect();
            }
        }
    }

    // 计算移动结果，同时记录 from→to 映射
    let moved = false;
    const mergedPositions = [];
    const tileMovements = {}; // { 'toR-toC': { fromR, fromC } }

    function slideRow(row, rowIndex, isColumn = false, colIndex = 0) {
        const originalRow = [...row];
        const nonZero = [];
        for (let i = 0; i < row.length; i++) {
            if (row[i] !== 0) nonZero.push({ val: row[i], origIdx: i });
        }

        const resultItems = [];
        let i = 0;
        while (i < nonZero.length) {
            if (i + 1 < nonZero.length && nonZero[i].val === nonZero[i + 1].val) {
                const merged = nonZero[i].val * 2;
                score += merged;
                if (merged === 2048 && !hasWon) {
                    hasWon = true;
                    setTimeout(() => document.getElementById('game-won').classList.add('show'), 200);
                }
                if (merged === 4096 && !hasSuperWon) {
                    hasSuperWon = true;
                    setTimeout(() => document.getElementById('game-super-won').classList.add('show'), 300);
                }
                resultItems.push({ val: merged, merged: true, fromOrigIdx: [nonZero[i].origIdx, nonZero[i + 1].origIdx] });
                i += 2;
            } else {
                resultItems.push({ val: nonZero[i].val, merged: false, fromOrigIdx: [nonZero[i].origIdx] });
                i++;
            }
        }

        const result = Array(4).fill(0);
        for (let j = 0; j < resultItems.length; j++) {
            result[j] = resultItems[j].val;
            resultItems[j].fromOrigIdx.forEach(fromIdx => {
                const fromR = isColumn ? fromIdx : rowIndex;
                const fromC = isColumn ? colIndex : fromIdx;
                const toR = isColumn ? j : rowIndex;
                const toC = isColumn ? colIndex : j;
                tileMovements[`${toR}-${toC}`] = { fromR, fromC };
            });
            if (resultItems[j].merged) {
                // 记录合并位置，以及合并前的原始值（合并值的一半）
                const fromValue = resultItems[j].val / 2;
                if (isColumn) mergedPositions.push({ r: j, c: colIndex, fromValue });
                else mergedPositions.push({ r: rowIndex, c: j, fromValue });
            }
        }

        return { result, changed: JSON.stringify(result) !== JSON.stringify(originalRow) };
    }

    if (direction === 'left') {
        for (let r = 0; r < 4; r++) {
            const { result, changed } = slideRow(board[r], r);
            if (changed) { moved = true; board[r] = result; }
        }
    } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) {
            const reversed = [...board[r]].reverse();
            const { result, changed } = slideRow(reversed, r);
            if (changed) {
                moved = true;
                board[r] = [...result].reverse();
                // 修正坐标（镜像列）
                const keysToFix = Object.keys(tileMovements).filter(k => {
                    const [tr] = k.split('-').map(Number); return tr === r;
                });
                keysToFix.forEach(k => {
                    const [, tc] = k.split('-').map(Number);
                    const m = tileMovements[k];
                    if (m.fromR === r) m.fromC = 3 - m.fromC;
                    tileMovements[`${r}-${3 - tc}`] = m;
                    delete tileMovements[k];
                });
                mergedPositions.forEach(pos => { if (pos.r === r) pos.c = 3 - pos.c; });
            }
        }
    } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
            const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            const { result, changed } = slideRow(col, 0, true, c);
            if (changed) {
                moved = true;
                for (let r = 0; r < 4; r++) board[r][c] = result[r];
            }
        }
    } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
            const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            const { result, changed } = slideRow([...col].reverse(), 0, true, c);
            if (changed) {
                moved = true;
                const finalResult = [...result].reverse();
                for (let r = 0; r < 4; r++) board[r][c] = finalResult[r];
                // 修正坐标（镜像行）
                const keysToFix = Object.keys(tileMovements).filter(k => {
                    const [, tc] = k.split('-').map(Number); return tc === c;
                });
                keysToFix.forEach(k => {
                    const [tr] = k.split('-').map(Number);
                    const m = tileMovements[k];
                    if (m.fromC === c) m.fromR = 3 - m.fromR;
                    tileMovements[`${3 - tr}-${c}`] = m;
                    delete tileMovements[k];
                });
                mergedPositions.forEach(pos => { if (pos.c === c) pos.r = 3 - pos.r; });
            }
        }
    }

    if (!moved) return;

    // 移动成功，保存历史状态到栈并更新撤销按钮
    historyStack.push(previousState);
    updateUndoButton();

    isAnimating = true;
    updateScore();
    // 渲染状态：合并位置先显示为原始值，等动画完成后再显示为合并后的值
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const mergedInfo = mergedPositions.find(p => p.r === r && p.c === c);
            if (mergedInfo) {
                // 合并位置暂时显示为原始值
                renderTile(cell, mergedInfo.fromValue, false, false);
            } else {
                renderTile(cell, board[r][c], false, false);
            }
        }
    }

    // 对移动的棋子施加偏移，再过渡回 0
    requestAnimationFrame(() => {
        for (const [toKey, { fromR, fromC }] of Object.entries(tileMovements)) {
            const [toR, toC] = toKey.split('-').map(Number);
            const toCell = document.getElementById(`cell-${toR}-${toC}`);
            if (!toCell.classList.contains('is-tile')) continue;

            const fromRect = preRects[`${fromR}-${fromC}`];
            if (!fromRect) continue;

            const toRect = toCell.getBoundingClientRect();
            const dx = fromRect.left - toRect.left;
            const dy = fromRect.top - toRect.top;

            if (dx === 0 && dy === 0) continue;

            // 先瞬间移到来源位置
            toCell.style.transition = 'none';
            toCell.style.transform = `translate(${dx}px, ${dy}px)`;

            // 下一帧平滑归位
            requestAnimationFrame(() => {
                toCell.style.transition = 'transform 200ms ease-out';
                toCell.style.transform = 'translate(0, 0)';
            });
        }

        // 动画结束后，添加新棋子和合并效果
        setTimeout(() => {
            // 清理所有移动和合并位置的动画样式
            const allAnimatedKeys = new Set([
                ...Object.keys(tileMovements),
                ...mergedPositions.map(p => `${p.r}-${p.c}`)
            ]);
            for (const key of allAnimatedKeys) {
                const [r, c] = key.split('-').map(Number);
                const cell = document.getElementById(`cell-${r}-${c}`);
                if (cell) {
                    // 禁用 transition 避免清理时产生动画，然后清除 transform
                    cell.style.transition = 'none';
                    cell.style.transform = '';
                    // 强制重绘以确保样式立即生效
                    void cell.offsetHeight;
                    // 恢复 transition 以便 CSS 动画可以正常工作
                    cell.style.transition = '';
                }
            }

            const newTile = addNewTile();
            if (newTile) updateCell(newTile.r, newTile.c, true, false);
            // 动画完成后，将合并位置更新为合成后的值，并添加合并动画
            mergedPositions.forEach(pos => updateCell(pos.r, pos.c, false, true));

            if (isGameOver()) {
                setTimeout(() => document.getElementById('game-over').classList.add('show'), 300);
            }

            isAnimating = false;
            updateSwitchButton();  // 移动完成后更新交换按钮状态
        }, 210);
    });
}
