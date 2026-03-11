/**
 * 版本信息模块
 * TileFuse v1.2.2
 * Author: Chace Tong
 */

const APP_INFO = {
    name: 'TileFuse',
    version: '1.2.2',
    author: 'Chace Tong',
    lastUpdated: '2026-03-11T13:25:36+08:00'
};

/**
 * 获取版本信息
 */
function getVersionInfo() {
    return {
        ...APP_INFO,
        versionString: `v${APP_INFO.version}`,
        fullString: `${APP_INFO.name} v${APP_INFO.version} by ${APP_INFO.author}`
    };
}

/**
 * 在控制台显示版本信息
 */
function showVersion() {
    const info = getVersionInfo();
    console.log(
        `%c ${info.name} %c ${info.versionString} `,
        'background: #579b62; color: white; padding: 4px 8px; border-radius: 4px 0 0 4px;',
        'background: #8b7e6a; color: white; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
    console.log(`Author: ${info.author}`);
    console.log(`Last Updated: ${info.lastUpdated}`);
    return info;
}

// 页面加载时显示版本
if (typeof window !== 'undefined') {
    window.APP_INFO = APP_INFO;
    window.getVersionInfo = getVersionInfo;
    window.showVersion = showVersion;
    
    // DOM 加载完成后显示版本
    document.addEventListener('DOMContentLoaded', () => {
        showVersion();
        updateVersionDisplay();
    });
}

/**
 * 更新页面上的版本显示
 */
function updateVersionDisplay() {
    const versionElements = document.querySelectorAll('[data-version]');
    versionElements.forEach(el => {
        el.textContent = APP_INFO.version;
    });
}
