/**
 * webAudio演示ppt
 * created by lduoduo
 * 依赖: webAudio.js
 */

// 引入样式文件
import './webAudio.scss';

// 嵌入markdown
ppt.markdown({
    'page1.md': require('./markdown/page1.md'),
    'page2.md': require('./markdown/page2.md')
})
ppt.init()
