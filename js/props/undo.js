/**
 * 撤销道具模块
 */

// 更新撤销按钮状态
function updateUndoButton() {
    const propItem = document.getElementById('prop-return');
    const propImg = document.getElementById('prop-return-img');

    if (historyStack.length > 0) {
        // 可用状态
        propItem.classList.remove('disabled');
        propImg.src = 'Assets/props/undo-active.png';
    } else {
        // 不可用状态
        propItem.classList.add('disabled');
        propImg.src = 'Assets/props/undo-disabled.png';
    }
}

// 撤销上一步（可连续撤销）
function undoMove() {
    if (historyStack.length === 0 || isAnimating) return;

    // 从历史栈弹出最后一个状态
    const lastState = historyStack.pop();

    // 恢复历史状态
    board = lastState.board.map(row => [...row]);
    score = lastState.score;

    // 更新显示
    updateScore();
    updateUndoButton();
    updateSwitchButton();  // 撤销后更新交换按钮状态
    updateUpgradeButton(); // 撤销后更新升级按钮状态
    render();
}
