/**
 * 交换道具模块
 */

function isSwitchAvailable() {
    if (switchCount <= 0) return false;

    const tiles = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) tiles.push(board[r][c]);
        }
    }
    if (tiles.length < 2) return false;
    
    const first = tiles[0];
    return !tiles.every(lv => lv === first);
}

function updateSwitchButton() {
    const propItem = document.getElementById('prop-switch');
    const propImg = document.getElementById('prop-switch-img');
    const countBadge = document.getElementById('prop-switch-count');
    const countText = countBadge.querySelector('.prop-count-text');
    const countBg = countBadge.querySelector('.prop-count-bg');
    const available = isSwitchAvailable();

    countText.textContent = switchCount;

    if (available) {
        propItem.classList.remove('disabled');
        propImg.src = 'Assets/props/switch-active.png';
        countBg.src = 'Assets/props/badge-active.png';
    } else {
        propItem.classList.add('disabled');
        propImg.src = 'Assets/props/switch-disabled.png';
        if (switchCount <= 0) countBg.src = 'Assets/props/badge-disabled.png';
        if (isSwitchMode) exitSwitchMode();
    }
}

function toggleSwitchMode() {
    if (isAnimating || !isSwitchAvailable()) return;
    isSwitchMode ? exitSwitchMode() : enterSwitchMode();
}

function enterSwitchMode() {
    isSwitchMode = true;
    selectedCell = null;
    document.getElementById('prop-switch').classList.add('active');
    attachSwitchClickHandlers();
    showToast('依次点击两个不同的棋子进行交换');
}

function exitSwitchMode() {
    isSwitchMode = false;
    if (selectedCell) {
        const cell = document.getElementById(`cell-${selectedCell.r}-${selectedCell.c}`);
        if (cell) cell.classList.remove('cell-selected');
        selectedCell = null;
    }
    document.getElementById('prop-switch').classList.remove('active');
    detachSwitchClickHandlers();
}

function attachSwitchClickHandlers() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                cell.dataset.switchClick = 'true';
                cell.onclick = () => handleSwitchClick(r, c);
            }
        }
    }
}

function detachSwitchClickHandlers() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            cell.dataset.switchClick = '';
            cell.onclick = null;
            cell.classList.remove('cell-selected');
        }
    }
}

function handleSwitchClick(r, c) {
    if (!isSwitchMode || isAnimating || board[r][c] === 0) return;

    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
        document.getElementById(`cell-${r}-${c}`).classList.remove('cell-selected');
        selectedCell = null;
        return;
    }

    if (!selectedCell) {
        selectedCell = { r, c };
        document.getElementById(`cell-${r}-${c}`).classList.add('cell-selected');
        return;
    }

    switchTiles(selectedCell, { r, c });
    exitSwitchMode();
}

function switchTiles(first, second) {
    isAnimating = true;

    historyStack.push({
        board: board.map(row => [...row]),
        score: score
    });
    updateUndoButton();

    const firstCell = document.getElementById(`cell-${first.r}-${first.c}`);
    const secondCell = document.getElementById(`cell-${second.r}-${second.c}`);
    const firstRect = firstCell.getBoundingClientRect();
    const secondRect = secondCell.getBoundingClientRect();

    const dx = secondRect.left - firstRect.left;
    const dy = secondRect.top - firstRect.top;
    const dx2 = firstRect.left - secondRect.left;
    const dy2 = firstRect.top - secondRect.top;

    const firstClone = firstCell.cloneNode(true);
    const secondClone = secondCell.cloneNode(true);

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

    document.body.appendChild(firstClone);
    document.body.appendChild(secondClone);

    firstCell.style.opacity = '0';
    secondCell.style.opacity = '0';

    requestAnimationFrame(() => {
        firstClone.style.transform = `translate(${dx}px, ${dy}px)`;
        secondClone.style.transform = `translate(${dx2}px, ${dy2}px)`;
    });

    setTimeout(() => {
        [board[first.r][first.c], board[second.r][second.c]] = [board[second.r][second.c], board[first.r][first.c]];
        switchCount--;
        render();
        updateSwitchButton();

        firstClone.style.transition = secondClone.style.transition = 'opacity 100ms ease-out';
        firstClone.style.opacity = secondClone.style.opacity = '0';

        firstCell.style.transition = secondCell.style.transition = 'opacity 100ms ease-out';
        firstCell.style.opacity = secondCell.style.opacity = '1';

        setTimeout(() => {
            firstClone.remove();
            secondClone.remove();
            firstCell.style.transition = secondCell.style.transition = '';
            firstCell.style.opacity = secondCell.style.opacity = '';
            isAnimating = false;
        }, 100);
    }, 300);
}
