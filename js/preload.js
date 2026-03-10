/**
 * 图片预加载模块
 * 在游戏开始前预加载所有必要的图片资源
 */

// 需要预加载的图片列表
const PRELOAD_IMAGES = {
    // 棋子图片（三种风格）
    tiles: [
        2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096
    ],
    styles: ['type_01', 'type_02', 'type_03'],
    
    // 道具图片
    props: [
        'prop_undo_default.png',
        'prop_undo_disable.png',
        'prop_switch_default.png',
        'prop_switch_disable.png',
        'prop_restart_default.png',
        'prop_restart_disable.png',
        'prop_number_bg_default.png',
        'prop_number_bg_disable.png'
    ]
};

// 预加载单张图片
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
    });
}

// 预加载所有图片
async function preloadAllImages() {
    const imagePromises = [];
    
    // 预加载所有风格的棋子图片
    PRELOAD_IMAGES.styles.forEach(style => {
        PRELOAD_IMAGES.tiles.forEach(value => {
            const src = `Assets/item/${style}/img_bg_${value}.png`;
            imagePromises.push(preloadImage(src));
        });
    });
    
    // 预加载道具图片
    PRELOAD_IMAGES.props.forEach(prop => {
        const src = `Assets/props/${prop}`;
        imagePromises.push(preloadImage(src));
    });
    
    try {
        await Promise.all(imagePromises);
        console.log(`✅ 预加载完成：${imagePromises.length} 张图片`);
        return true;
    } catch (error) {
        console.warn('⚠️ 部分图片预加载失败:', error);
        // 即使部分失败也继续游戏
        return true;
    }
}

// 初始化时预加载
async function initWithPreload() {
    // 显示加载状态（可选）
    const grid = document.getElementById('grid');
    if (grid) {
        grid.innerHTML = '<div class="loading-text">Loading...</div>';
    }
    
    // 预加载图片
    await preloadAllImages();
    
    // 初始化游戏
    init();
}
