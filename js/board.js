/**
 * 棋盘操作模块
 * 包含棋盘渲染、格子操作等功能
 */

// 创建网格 DOM
function createGridDOM() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.createElement('div');
            cell.className = `grid-cell row-${r}`;
            cell.id = `cell-${r}-${c}`;
            // 背景图片容器（底层）
            const bgDiv = document.createElement('div');
            bgDiv.className = 'tile-bg';
            cell.appendChild(bgDiv);
            // 图案层（中间层）
            const patternDiv = document.createElement('div');
            patternDiv.className = 'tile-pattern';
            cell.appendChild(patternDiv);
            // 内部文本容器（顶层）
            const textSpan = document.createElement('span');
            textSpan.className = 'tile-text';
            cell.appendChild(textSpan);
            grid.appendChild(cell);
        }
    }
}

// 渲染单个棋子
function renderTile(cell, value, isNew = false, isMerged = false) {
    const config = getTileConfig(value);
    const textSpan = cell.querySelector('.tile-text');
    const bgDiv = cell.querySelector('.tile-bg');
    const patternDiv = cell.querySelector('.tile-pattern');

    // 重置类名和内联样式
    const rowClass = Array.from(cell.classList).find(cls => cls.startsWith('row-'));
    cell.className = `grid-cell ${rowClass}`;
    bgDiv.removeAttribute('style');
    patternDiv.removeAttribute('style');
    // 强制清除所有可能残留的视觉样式
    cell.style.cssText = '';

    // 应用图片或样式
    if (value > 0) {
        cell.classList.add('is-tile');
        const className = value <= 4096 ? `tile-${value}` : 'tile-super';
        cell.classList.add(className);

        if (config.bgImage) {
            // 背景图模式
            cell.classList.add('has-image');
            bgDiv.style.backgroundImage = `url(${config.bgImage})`;
            // 图案层
            patternDiv.style.backgroundImage = `url(${config.patternImage})`;
        }
    } else {
        cell.classList.remove('is-tile');
    }

    // 设置文本
    textSpan.textContent = (value === 0 || HIDE_NUMBERS) ? '' : value;

    // 添加动画类
    if (isNew) cell.classList.add('tile-new');
    if (isMerged) cell.classList.add('tile-merge');
}

// 更新单个格子的显示（用于动画效果）
function updateCell(r, c, isNew = false, isMerged = false) {
    const cell = document.getElementById(`cell-${r}-${c}`);
    const value = board[r][c];
    renderTile(cell, value, isNew, isMerged);
}

// 渲染整个棋盘
function render() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const value = board[r][c];
            renderTile(cell, value);
        }
    }
}

// 添加新棋子
function addNewTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }
    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
        return { r, c, isNew: true };
    }
    return null;
}
