/**
 * 工具函数模块
 */

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
}

function hideOverlays() {
    document.getElementById('game-over').classList.remove('show');
    document.getElementById('level-won').classList.remove('show');
    document.getElementById('game-won').classList.remove('show');
}

/**
 * 更新分数显示
 * 同时保存最高分
 */
function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > bestScore) {
        bestScore = score;
        if (currentDifficulty) {
            localStorage.setItem(`tilefuse_best_${currentDifficulty}`, bestScore);
        }
    }
    document.getElementById('best-score').textContent = bestScore;
}

/**
 * 检查游戏结束
 */
function isGameOver() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const lv = board[r][c];
            if (lv === 0) return false;
            if (c < gridSize - 1 && lv === board[r][c + 1]) return false;
            if (r < gridSize - 1 && lv === board[r + 1][c]) return false;
        }
    }
    return true;
}
