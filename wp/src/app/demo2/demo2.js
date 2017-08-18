/**
 * 演示ppt demo
 * created by lduoduo
 */

// 引入样式文件
import './demo2.scss';

window.home = {
    init() {
        this.initPPT()
    },
    initPPT() {
        // 嵌入markdown
        ppt.markdown({
            'page0.md': require('./markdown/page0.md'),
            'page1.md': require('./markdown/page1.md')
        })
        ppt.init()
        ppt.on('ready', () => {
            console.log('ready')
            if (!/(android|ios)/gi.test(platform.os.family)) return
            ppt.initDebug(true)
        })
        ppt.onPage('page2', (e) => {
            console.log('page2: ' + e)
        })
    }
}

home.init()

