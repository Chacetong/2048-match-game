/**
 * 游戏配置模块
 */

// 是否隐藏等级文本
const HIDE_TEXT = true;

// 棋盘大小 (由难度决定)
let gridSize = 4;

// 主题设置
let currentStyleSet = 'theme-01';
let currentPatternSet = '01';

// 棋子配置
const tileStyles = {
    0: { style: { background: 'rgba(238, 228, 218, 0.6)' } },
    
    getBgImage: (level) => {
        if (currentStyleSet === 'theme-03') return 'Assets/tiles/theme-03/1.png';
        return `Assets/tiles/${currentStyleSet}/${level}.png`;
    },
    
    getPatternImage: (level) => `Assets/tiles/overlay/set-${currentPatternSet}/${level}.png`
};

function getTileConfig(level) {
    if (level === 0) return tileStyles[0];
    const displayLv = level > 12 ? 12 : level;
    return {
        bgImage: tileStyles.getBgImage(displayLv),
        patternImage: tileStyles.getPatternImage(displayLv)
    };
}

function switchStyle(styleSet, btn) {
    currentStyleSet = styleSet;
    
    // 更新按钮状态
    const switchEl = document.getElementById('plate-switch');
    switchEl.querySelectorAll('.switch-btn').forEach((b, index) => {
        b.classList.remove('active');
        if (b === btn) {
            b.classList.add('active');
            // 移动滑块
            const slider = switchEl.querySelector('.switch-slider');
            slider.style.transform = `translateX(${index * 100}%)`;
        }
    });
    
    render();
}

function switchPattern(patternSet, btn) {
    currentPatternSet = patternSet;
    
    // 更新按钮状态
    const switchEl = document.getElementById('pattern-switch');
    switchEl.querySelectorAll('.switch-btn').forEach((b, index) => {
        b.classList.remove('active');
        if (b === btn) {
            b.classList.add('active');
            // 移动滑块
            const slider = switchEl.querySelector('.switch-slider');
            slider.style.transform = `translateX(${index * 100}%)`;
        }
    });
    
    render();
}

function updateGridStyle() {
    const grid = document.getElementById('grid');
    grid.classList.remove('grid-size-3', 'grid-size-4', 'grid-size-5');
    grid.classList.add(`grid-size-${gridSize}`);
}
