/**
 * 游戏入口模块
 * 设置事件监听
 */

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    // 只有在游戏页才响应键盘
    if (document.getElementById('game-page').classList.contains('hidden')) return;
    
    switch (e.key) {
        case 'ArrowUp': e.preventDefault(); move('up'); break;
        case 'ArrowDown': e.preventDefault(); move('down'); break;
        case 'ArrowLeft': e.preventDefault(); move('left'); break;
        case 'ArrowRight': e.preventDefault(); move('right'); break;
    }
});

// 触摸事件监听
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        gameContainer.addEventListener('touchend', (e) => {
            // 只有在游戏页才响应触摸
            if (document.getElementById('game-page').classList.contains('hidden')) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const minSwipeDistance = 50;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipeDistance) {
                    dx > 0 ? move('right') : move('left');
                }
            } else {
                if (Math.abs(dy) > minSwipeDistance) {
                    dy > 0 ? move('down') : move('up');
                }
            }
        }, { passive: true });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
});

// 重新开始确认弹窗
function showRestartConfirm() {
    document.getElementById('restart-confirm').classList.add('show');
}

function confirmRestart() {
    document.getElementById('restart-confirm').classList.remove('show');
    newGame();
}

function cancelRestart() {
    document.getElementById('restart-confirm').classList.remove('show');
}
