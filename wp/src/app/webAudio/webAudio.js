/**
 * webAudio演示ppt demo
 * created by lduoduo
 * 依赖: webAudio.js
 */

// 引入样式文件
import './webAudio.scss';

window.home = {
    init() {
        this.initPPT()
    },
    initPPT() {
        // 嵌入markdown
        ppt.markdown({
            'page0.md': require('./markdown/page0.md'),
            'page1.md': require('./markdown/page1.md'),
            'page2.md': require('./markdown/page2.md'),
            'page3.md': require('./markdown/page3.md'),
            'page4.md': require('./markdown/page4.md'),
            'page5.md': require('./markdown/page5.md'),
            'page6.md': require('./markdown/page6.md'),
            'page7.md': require('./markdown/page7.md')
        })
        ppt.init(true)
        ppt.on('ready', function () {
            console.log('ready')
        })
    }
}

home.init()

