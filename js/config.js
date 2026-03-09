/**
 * 游戏配置模块
 * 包含棋子样式配置和全局设置
 */

// 是否快速隐藏数字？ (true: 隐藏, false: 显示)
const HIDE_NUMBERS = true;

// 当前切题风格集合 (type_01, type_02, type_03)
let currentStyleSet = 'type_01';

// 棋子样式配置
const tileStyles = {
    // 默认空格子样式
    0: {
        style: { background: 'rgba(238, 228, 218, 0.6)', color: 'transparent' }
    },

    // 通用图片配置获取函数
    getImage: (value) => `Assets/item/${currentStyleSet}/img_bg_${value}.png`
};

// 获取指定数字的配置
function getTileConfig(value) {
    if (value === 0) return tileStyles[0];
    return { image: tileStyles.getImage(value > 2048 ? 2048 : value) };
}

// 切换风格
function switchStyle(styleSet, btn) {
    currentStyleSet = styleSet;

    // 更新按钮激活状态
    document.querySelectorAll('.btn-style').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 重新渲染全部格子
    render();
}
