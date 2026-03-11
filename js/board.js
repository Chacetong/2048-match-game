/**
 * 棋盘操作模块
 */

// 创建网格 DOM
function createGridDOM() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    updateGridStyle();
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement('div');
            cell.className = `grid-cell row-${r}`;
            cell.id = `cell-${r}-${c}`;
            
            const bgDiv = document.createElement('div');
            bgDiv.className = 'tile-bg';
            cell.appendChild(bgDiv);
            
            const patternDiv = document.createElement('div');
            patternDiv.className = 'tile-pattern';
            cell.appendChild(patternDiv);
            
            const textSpan = document.createElement('span');
            textSpan.className = 'tile-text';
            cell.appendChild(textSpan);
            
            grid.appendChild(cell);
        }
    }
}

/**
 * 渲染单个棋子
 * @param {HTMLElement} cell - 格子元素
 * @param {number} level - 等级 (0-空, 1-Lv.1...)
 * @param {boolean} isNew - 是否新棋子
 * @param {boolean} isMerged - 是否合并
 */
function renderTile(cell, level, isNew = false, isMerged = false) {
    const config = getTileConfig(level);
    const textSpan = cell.querySelector('.tile-text');
    const bgDiv = cell.querySelector('.tile-bg');
    const patternDiv = cell.querySelector('.tile-pattern');

    // 重置样式
    const rowClass = Array.from(cell.classList).find(c => c.startsWith('row-'));
    cell.className = `grid-cell ${rowClass}`;
    bgDiv.removeAttribute('style');
    patternDiv.removeAttribute('style');
    cell.style.cssText = '';

    if (level > 0) {
        cell.classList.add('is-tile', getTileClass(level));
        
        if (config.bgImage) {
            cell.classList.add('has-image');
            bgDiv.style.backgroundImage = `url(${config.bgImage})`;
            patternDiv.style.backgroundImage = `url(${config.patternImage})`;
        }
    }

    textSpan.textContent = (level === 0 || HIDE_TEXT) ? '' : getLevelText(level);

    if (isNew) cell.classList.add('tile-new');
    if (isMerged) cell.classList.add('tile-merge');
}

/**
 * 更新格子
 */
function updateCell(r, c, isNew = false, isMerged = false) {
    const cell = document.getElementById(`cell-${r}-${c}`);
    renderTile(cell, board[r][c], isNew, isMerged);
}

// 渲染整个棋盘
function render() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            renderTile(document.getElementById(`cell-${r}-${c}`), board[r][c]);
        }
    }
    // 更新棋子展示模块
    if (typeof updateTileShowcase === 'function') {
        updateTileShowcase();
    }
}

// 添加新棋子
function addNewTile() {
    const empty = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length > 0) {
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        const newLevel = getNewTileLevel();
        board[r][c] = newLevel;
        
        // 更新达到过的最高等级
        if (typeof maxLevelReached !== 'undefined' && newLevel > maxLevelReached) {
            maxLevelReached = newLevel;
        }
        
        return { r, c, isNew: true };
    }
    return null;
}
