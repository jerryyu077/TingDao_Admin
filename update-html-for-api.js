#!/usr/bin/env node

/**
 * 批量更新 HTML 文件以引入 API 脚本
 * 使用方法: node update-html-for-api.js
 */

const fs = require('fs');
const path = require('path');

// API 脚本引用模板
const API_SCRIPTS = `
    <!-- API Client -->
    <script src="js/api-config.js"></script>
    <script src="js/api-client.js"></script>
    <script src="js/api-services.js"></script>`;

// 页面配置
const PAGE_CONFIGS = {
    'sermons.html': {
        scripts: [`    <script src="js/sermons-api.js"></script>`],
        removeScripts: true
    },
    'sermon-detail.html': {
        scripts: [`    <script src="js/sermons-api.js"></script>`],
        removeScripts: true
    },
    'add-sermon.html': {
        scripts: [`    <script src="js/sermons-api.js"></script>`],
        removeScripts: true
    },
    'speakers.html': {
        scripts: [`    <script src="js/speakers-api.js"></script>`],
        removeScripts: true
    },
    'speaker-detail.html': {
        scripts: [`    <script src="js/speakers-api.js"></script>`],
        removeScripts: true
    },
    'add-speaker.html': {
        scripts: [`    <script src="js/speakers-api.js"></script>`],
        removeScripts: true
    },
    'users.html': {
        scripts: [`    <script src="js/users-api.js"></script>`],
        removeScripts: true
    },
    'user-detail.html': {
        scripts: [`    <script src="js/users-api.js"></script>`],
        removeScripts: true
    },
    'home-editor.html': {
        scripts: [`    <script src="js/curation-api.js"></script>`],
        removeScripts: true
    },
    'discover-editor.html': {
        scripts: [`    <script src="js/curation-api.js"></script>`],
        removeScripts: true
    },
    'curation.html': {
        scripts: [`    <script src="js/curation-api.js"></script>`],
        removeScripts: true
    },
    'topic-groups.html': {
        scripts: [`    <script src="js/curation-api.js"></script>`],
        removeScripts: true
    }
};

function updateHtmlFile(filename, config) {
    const filepath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  文件不存在: ${filename}`);
        return false;
    }
    
    let content = fs.readFileSync(filepath, 'utf8');
    
    // 检查是否已经添加过 API 脚本
    if (content.includes('api-config.js')) {
        console.log(`✅ ${filename} - 已包含 API 脚本，跳过`);
        return false;
    }
    
    // 查找 </head> 标签的位置
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex === -1) {
        console.log(`❌ ${filename} - 未找到 </head> 标签`);
        return false;
    }
    
    // 构建要插入的脚本
    let scriptsToInsert = API_SCRIPTS;
    if (config.scripts && config.scripts.length > 0) {
        scriptsToInsert += '\n' + config.scripts.join('\n');
    }
    scriptsToInsert += '\n    ';
    
    // 插入脚本
    const newContent = content.slice(0, headEndIndex) + 
                      scriptsToInsert + 
                      content.slice(headEndIndex);
    
    // 写回文件
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`✅ ${filename} - 已添加 API 脚本引用`);
    
    return true;
}

function main() {
    console.log('🚀 开始批量更新 HTML 文件...\n');
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    Object.entries(PAGE_CONFIGS).forEach(([filename, config]) => {
        const result = updateHtmlFile(filename, config);
        if (result === true) {
            successCount++;
        } else if (result === false) {
            skipCount++;
        } else {
            errorCount++;
        }
    });
    
    console.log('\n📊 更新统计:');
    console.log(`   成功: ${successCount} 个文件`);
    console.log(`   跳过: ${skipCount} 个文件`);
    console.log(`   失败: ${errorCount} 个文件`);
    console.log('\n✨ 完成！请手动检查更新后的文件。');
    console.log('💡 提示: 记得删除页面中的假数据数组和旧的初始化代码。');
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { updateHtmlFile, PAGE_CONFIGS };

