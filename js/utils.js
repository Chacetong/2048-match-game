/**
 * 工具函数模块
 */

// 显示 Toast 提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('show');
    // 强制重绘以重置动画
    void toast.offsetWidth;
    toast.classList.add('show');
}

// 隐藏游戏结束/获胜遮罩
function hideOverlays() {
    document.getElementById('game-over').classList.remove('show');
    document.getElementById('game-won').classList.remove('show');
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
    // 最高分只在单次会话保留，不存入 localStorage
    if (score > bestScore) {
        bestScore = score;
    }
    document.getElementById('best-score').textContent = bestScore;
}

// 检查游戏是否结束
function isGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return false;
            if (c < 3 && board[r][c] === board[r][c + 1]) return false;
            if (r < 3 && board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}
