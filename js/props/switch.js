/**
 * 交换道具模块
 */

// 检查交换道具是否可用（0/1个棋子不可用；次数为0不可用；2+个棋子时，全相同则不可用，否则可用）
function isSwitchAvailable() {
    // 次数为0时不可用
    if (switchCount <= 0) return false;

    const tiles = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] !== 0) {
                tiles.push({ r, c, value: board[r][c] });
            }
        }
    }
    // 0 或 1 个棋子：不可用
    if (tiles.length < 2) return false;
    // 2+ 个棋子：检查是否全都相同
    const firstValue = tiles[0].value;
    const allSame = tiles.every(tile => tile.value === firstValue);
    // 全都相同则不可用，否则可用
    return !allSame;
}

// 更新交换按钮状态
function updateSwitchButton() {
    const propItem = document.getElementById('prop-switch');
    const propImg = document.getElementById('prop-switch-img');
    const countBadge = document.getElementById('prop-switch-count');
    const countText = countBadge.querySelector('.prop-count-text');
    const countBg = countBadge.querySelector('.prop-count-bg');
    const available = isSwitchAvailable();

    // 更新次数显示
    countText.textContent = switchCount;

    if (available) {
        // 可用状态
        propItem.classList.remove('disabled');
        propImg.src = 'Assets/props/switch-active.png';
        countBg.src = 'Assets/props/badge-active.png';
    } else {
        // 不可用状态
        propItem.classList.add('disabled');
        propImg.src = 'Assets/props/switch-disabled.png';
        if (switchCount <= 0) {
            // 次数为0时切换为灰色背景
            countBg.src = 'Assets/props/badge-disabled.png';
        }
        // 如果正在交换模式，退出
        if (isSwitchMode) {
            exitSwitchMode();
        }
    }
}

// 切换交换模式
function toggleSwitchMode() {
    if (isAnimating) return;

    // 如果不可用，点击无效
    if (!isSwitchAvailable()) return;

    if (isSwitchMode) {
        exitSwitchMode();
    } else {
        enterSwitchMode();
    }
}

// 进入交换模式
function enterSwitchMode() {
    isSwitchMode = true;
    selectedCell = null;
    // 添加 active 类触发动画
    const propItem = document.getElementById('prop-switch');
    propItem.classList.add('active');
    attachSwitchClickHandlers();
    // 显示提示 Toast
    showToast('依次点击两个不同的棋子进行交换');
}

// 退出交换模式
function exitSwitchMode() {
    isSwitchMode = false;
    // 清除选中状态
    if (selectedCell) {
        const cell = document.getElementById(`cell-${selectedCell.r}-${selectedCell.c}`);
        if (cell) cell.classList.remove('cell-selected');
        selectedCell = null;
    }
    // 移除 active 类停止动画
    const propItem = document.getElementById('prop-switch');
    propItem.classList.remove('active');
    // 移除点击事件
    detachSwitchClickHandlers();
}

// 为格子添加交换点击事件（只给有棋子的格子）
function attachSwitchClickHandlers() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            // 只给有棋子的格子添加点击事件
            if (board[r][c] !== 0) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                cell.dataset.switchClick = 'true';
                cell.onclick = function () {
                    handleSwitchClick(r, c);
                };
            }
        }
    }
}

// 移除格子的交换点击事件
function detachSwitchClickHandlers() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            cell.dataset.switchClick = '';
            cell.onclick = null;
            cell.classList.remove('cell-selected');
        }
    }
}

// 处理交换点击
function handleSwitchClick(r, c) {
    if (!isSwitchMode || isAnimating) return;

    // 只能点击有棋子的格子
    if (board[r][c] === 0) return;

    // 如果点击的是已选中的棋子，取消选中
    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
        const cell = document.getElementById(`cell-${r}-${c}`);
        cell.classList.remove('cell-selected');
        selectedCell = null;
        return;
    }

    // 如果还没有选中第一个棋子
    if (!selectedCell) {
        selectedCell = { r, c };
        const cell = document.getElementById(`cell-${r}-${c}`);
        cell.classList.add('cell-selected');
        return;
    }

    // 已经选中了第一个棋子，现在选中第二个，执行交换
    const firstCell = selectedCell;
    const secondCell = { r, c };

    // 执行交换
    switchTiles(firstCell, secondCell);

    // 退出交换模式
    exitSwitchMode();
}

// 交换两个棋子（带动画）
function switchTiles(first, second) {
    isAnimating = true;

    // 保存当前状态到历史栈（允许撤销交换）
    historyStack.push({
        board: board.map(row => [...row]),
        score: score
    });
    updateUndoButton();

    // 获取两个棋子的 DOM 元素
    const firstCell = document.getElementById(`cell-${first.r}-${first.c}`);
    const secondCell = document.getElementById(`cell-${second.r}-${second.c}`);

    // 获取位置信息
    const firstRect = firstCell.getBoundingClientRect();
    const secondRect = secondCell.getBoundingClientRect();

    // 计算偏移量
    const dx = secondRect.left - firstRect.left;
    const dy = secondRect.top - firstRect.top;
    const dx2 = firstRect.left - secondRect.left;
    const dy2 = firstRect.top - secondRect.top;

    // 创建两个临时克隆元素用于动画
    const firstClone = firstCell.cloneNode(true);
    const secondClone = secondCell.cloneNode(true);

    // 设置克隆元素的样式
    [firstClone, secondClone].forEach(clone => {
        clone.style.position = 'fixed';
        clone.style.zIndex = '1000';
        clone.style.transition = 'transform 300ms ease-out';
        clone.classList.remove('cell-selected');
    });

    firstClone.style.left = firstRect.left + 'px';
    firstClone.style.top = firstRect.top + 'px';
    firstClone.style.width = firstRect.width + 'px';
    firstClone.style.height = firstRect.height + 'px';

    secondClone.style.left = secondRect.left + 'px';
    secondClone.style.top = secondRect.top + 'px';
    secondClone.style.width = secondRect.width + 'px';
    secondClone.style.height = secondRect.height + 'px';

    // 添加到 body
    document.body.appendChild(firstClone);
    document.body.appendChild(secondClone);

    // 隐藏原格子
    firstCell.style.opacity = '0';
    secondCell.style.opacity = '0';

    // 强制重绘后开始动画
    requestAnimationFrame(() => {
        firstClone.style.transform = `translate(${dx}px, ${dy}px)`;
        secondClone.style.transform = `translate(${dx2}px, ${dy2}px)`;
    });

    // 动画完成后清理
    setTimeout(() => {
        // 先交换 board 中的值
        const temp = board[first.r][first.c];
        board[first.r][first.c] = board[second.r][second.c];
        board[second.r][second.c] = temp;

        // 减少使用次数
        switchCount--;

        // 渲染新状态（此时原格子仍透明）
        render();
        updateSwitchButton();

        // 克隆元素渐隐，同时原格子渐显
        firstClone.style.transition = 'opacity 100ms ease-out';
        secondClone.style.transition = 'opacity 100ms ease-out';
        firstClone.style.opacity = '0';
        secondClone.style.opacity = '0';

        // 原格子渐显
        firstCell.style.transition = 'opacity 100ms ease-out';
        secondCell.style.transition = 'opacity 100ms ease-out';
        firstCell.style.opacity = '1';
        secondCell.style.opacity = '1';

        // 过渡完成后移除克隆并清理
        setTimeout(() => {
            firstClone.remove();
            secondClone.remove();

            // 清理 transition 样式
            firstCell.style.transition = '';
            secondCell.style.transition = '';
            firstCell.style.opacity = '';
            secondCell.style.opacity = '';

            isAnimating = false;
        }, 100);
    }, 300);
}
