/**
 * 游戏配置模块
 * 包含棋子样式配置和全局设置
 */

// 是否快速隐藏数字？ (true: 隐藏, false: 显示)
const HIDE_NUMBERS = true;

// 当前切题风格集合 (type_01, type_02, type_03)
let currentStyleSet = 'type_01';

// 当前图案风格 (01, 02, 03)
let currentPatternSet = '01';

// 棋子样式配置
const tileStyles = {
    // 默认空格子样式
    0: {
        style: { background: 'rgba(238, 228, 218, 0.6)', color: 'transparent' }
    },

    // 背景图配置获取函数
    getBgImage: (value) => `Assets/item/${currentStyleSet}/img_bg_${value}.png`,
    
    // 图案层配置获取函数
    getPatternImage: (value) => `Assets/item/pattern/${currentPatternSet}/item_pattern_${currentPatternSet}_${value}.png`
};

// 获取指定数字的配置
function getTileConfig(value) {
    if (value === 0) return tileStyles[0];
    // 支持 4096 的图片，超过 4096 使用 4096 的图片
    const displayValue = value > 4096 ? 4096 : value;
    return { 
        bgImage: tileStyles.getBgImage(displayValue),
        patternImage: tileStyles.getPatternImage(displayValue)
    };
}

// 切换风格（同时切换背景和图案）
function switchStyle(styleSet, btn) {
    currentStyleSet = styleSet;
    // 图案风格与背景风格保持一致
    currentPatternSet = styleSet.replace('type_', '');

    // 更新按钮激活状态
    document.querySelectorAll('.btn-style').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 重新渲染全部格子
    render();
}
