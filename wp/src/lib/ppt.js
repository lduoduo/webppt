/**
 * ppt演示框架源码
 * created by lduoduo on 2017-08-11
 * last updated by lduoduo on 2017-08-12
 * 
 * 调用步骤:
 * 1. 引入 ppt.js / ppt.css
 * 2. 初始化环境
 *      ppt.init(isTouchDebug) // 是否开启touch端debug模式
 * 3. 插入markdown文件
 *      ppt.markdown({
            'page1.md': require('./markdown/page1.md'),
            'page2.md': require('./markdown/page2.md'),
            'page3.md': require('./markdown/page3.md')
        })
 * 说明(目标功能，待完善):
 * 1. 键盘事件:
 *      - 左右箭头切换上一页、下一页
 *      - 字母b: 开启、关闭绘图模式
 *      - 字母r: 开启、关闭矩形绘图模式
 *      - 字母n: 开启、关闭注释弹框
 *      - 字母o: 开启、关闭全局预览模式
 * 2. 回调注册:
 *      - ppt.on('ready', cb) // ppt准备就绪的回调
 *      - ppt.on('before')
 * 3. 自定义键盘事件注册:
 *      - ppt.onKeyDown('keycode',cb) // 键盘code, 回调(回调里传递参数：当前pageid)
 * 4. 自定义转场事件回调
 *      - ppt.onPage('pageid', cb) // 页面id, 回调(回调里面会传递参数 in / out)
 * 5. 延迟加载自定义脚本
 *      - ppt.lazyLoad(url).then(cb)
 */


// 引入样式文件
import './ppt.scss';

function $(selector) {
    return document.querySelector(selector)
}

function $$(selector) {
    return document.querySelectorAll(selector)
}

window.ppt = {
    isOverView: false,
    // 回调监听
    listeners: {},
    // 自定义键盘事件
    keyEvents: {},
    // 自定义dom事件
    domEvents: {},
    // 各种管理dom的缓存
    dom: {},
    // 幻灯片dom数组
    doms: [],
    _tpl: {
        arrow: '<a class="rect"></a><a class="edit"></a><a class="arrow left"></a><a class="arrow right"></a>',
        touch: '<a class="touch-btn">清除日志</a><div class="touch-log">'
    },
    /**
     * 嵌入markdown内容
     * 
     * @param {any} array 数据格式: {name:content}
     */
    markdown(obj) {
        if (!obj || obj.constructor !== Object) return
        for (let i in obj) {
            let selector = `[name=markdown][data-template="${i}"]`
            $(selector).innerHTML = `<section>${obj[i]}</section>`
        }
    },
    // 事件注册
    on(name, cb) {
        if (!name || !cb || cb.constructor !== Function) return
        this.listeners[name] = cb
    },
    // 发送回调
    emit(type, name, data) {
        type = type || 'listeners'
        this[type] && this[type][name] && this[type][name](data)
    },
    // 初始化环境
    init(isTouchDebug = false) {
        let doms = this.doms = $$('.ppt .page')
        doms[0].classList.add('curr')

        // 如果ppt张数多余1，显示箭头
        if (doms.length > 1) {
            this.initControl()
        }

        // 给每个page加个id
        doms.forEach((item, index) => {
            item.id = `page${index + 1}`
        })

        this.initEvent()
        this.initKeyEvent()
        this.initPageEvent()
        this.initCanvas()
        this.initProgressBar()

        // 监听hash变动
        window.onhashchange = this.hashChange.bind(this);

        this.lazyLoad([
            'https://ldodo.cc/static/lib/platform.js',
            'https://ldodo.cc/static/lib/fastclick.min.js'
        ]).then(() => {

            FastClick.attach(document.body)
            // 回调ready
            this.emit('listeners', 'ready')

            this.initTouch(isTouchDebug)
        })
    },
    // 移动端开启debug
    initTouch(isTouchDebug) {
        // alert('1')
        // Mt.alert({
        //     title: 'broswer info',
        //     msg: JSON.stringify(platform),
        //     confirmBtnMsg: 'ok'
        // })

        if (!/(android|ios)/gi.test(platform.os.family)) return

        // 兼容移动端
        touch.init()
        this.dom.control.classList.toggle('touch', true)

        if (!isTouchDebug) return

        // 开启
        let that = this
        var dom = document.createElement('div')
        dom.className = 'touch-debug'
        dom.innerHTML = this._tpl.touch
        document.body.appendChild(dom)
        var logDiv = $('.ppt .touch-debug .touch-log')
        var btn = $('.ppt .touch-debug .touch-btn')
        btn.addEventListener('click', () => {
            logDiv.innerHTML = ""
        })
        window.console = {
            log(data, type) {
                var p = document.createElement('p')
                p.className = type || 'info'
                p.textContent = JSON.stringify(data)
                logDiv.appendChild(p)
            },
            error(data) {
                this.log(data, 'error')
            },
            warn(data) {
                this.log(data, 'warn')
            }
        }
    },
    // 初始化控制UI
    initControl() {
        this.dom.wrapper = $('.ppt #webppt')

        let control = this.dom.control = document.createElement('aside')
        control.className = 'ppt-controls'
        control.innerHTML = this._tpl.arrow
        document.body.appendChild(control)

        this.dom.control.left = $('.ppt-controls .left')
        this.dom.control.right = $('.ppt-controls .right')
        this.dom.control.edit = $('.ppt-controls .edit')
        this.dom.control.rect = $('.ppt-controls .rect')
        this.dom.control.addEventListener('click', this.clickControl.bind(this))
    },
    // 鼠标事件注册
    initEvent() {
        this.dom.wrapper.addEventListener('click', (e) => {

            console.log(e.target)
            // 图片全屏事件
            if (/img/gi.test(e.target.tagName)) {
                if (this.isOverView) return
                if (cvs.isEnabled) return
                this.toggleFullScreen(e.target)
                return
            }

            if (!this.isOverView) return
            if (/page/gi.test(e.target.className)) {
                let curr = $('.page.curr')
                let target = e.target
                curr.classList.toggle('curr', false)
                target.classList.toggle('curr', true)
                this.toggleOverView()
            }

        })
    },
    // 键盘事件注册
    initKeyEvent() {
        document.body.addEventListener('keydown', (e) => {
            console.log(e)
            let key = $('.page.curr').id;
            let code = e.keyCode;
            this.onKeyEvent(key, code)
        });
    },
    // 注册page转场事件
    initPageEvent() {
        var mo = new MutationObserver(this.onPageEvent.bind(this));
        var $dom = document.querySelector('#webppt');
        var options = {
            'childList': true,
            'attributes': true,
            'subtree': true
        };
        mo.observe($dom, options);
    },
    // 初始化canvas环境
    initCanvas() {
        let canvas = this.dom.canvas = document.createElement('canvas')
        canvas.className = "ppt-pageEditor"
        canvas.width = window.screen.availWidth;
        canvas.height = window.screen.availHeight;

        document.body.appendChild(canvas)

        cvs.init(canvas)
        cvs.on('arrow', (key) => {
            if (key < 0) {
                this.pageNext()
            }
            if (key > 0) {
                this.pagePrev()
            }
            // Mt.alert({
            //     title: 'arrow',
            //     msg: key,
            //     confirmBtnMsg: '好'
            // })
        })
    },
    // 初始化进度条
    initProgressBar() {
        let progress = this.dom.progress = document.createElement('p')
        progress.className = "ppt-progress"
        progress.width = 100

        document.body.appendChild(progress)
    },
    // 键盘事件回调
    onKeyEvent(pageid, keycode) {
        // 如果有自定义事件, 优先自定义事件
        if (this.keyEvents[keycode]) {
            return this.emit('keyEvents', keycode, pageid);
        }

        // 默认事件: 左箭头
        if (keycode === 37) {
            this.pagePrev()
            return
        }
        // 默认事件: 右箭头
        if (keycode === 39) {
            this.pageNext()
            return
        }
        // 默认事件: 开关绘图模式
        if (keycode === 66) {
            this.pageEdit('auto')
            return
        }

        // 默认事件: 开关矩形绘图模式
        if (keycode === 82) {
            this.pageEdit('rect')
            return
        }

        // 默认事件: 开关全局预览模式
        if (keycode === 79) {
            return this.toggleOverView()
        }

        // 默认事件: 全局模式下进入目标页面
        if (keycode === 13) {
            return this.toggleOverView()
        }

        // 默认事件: 全屏事件
        if (keycode === 122) {
            this.toggleFullScreen(document.body)
            cvs.updateWidthHeight()
            return
        }
    },
    // 自定义键盘事件
    onKeyDown(pageid, keycode, cb) {
        if (!pageid || !keycode || !cb) return
        this.keyEvents[`${pageid}_${keycode}`] = cb
    },
    // page转场回调
    onPageEvent(e) {
        console.log(e)
    },
    // 自定义page转场事件
    onPage(pageid, cb) {
        if (!pageid || !cb) return
        this.domEvents[`${pageid}`] = cb
    },
    // 右下角控制事件
    clickControl(e) {
        let dom = e.target
        if (dom.classList.contains('disabled')) return
        if (dom.classList.contains('left')) {
            this.pagePrev()
        }
        if (dom.classList.contains('right')) {
            this.pageNext()
        }
        if (dom.classList.contains('edit')) {
            this.pageEdit('auto')
        }
        if (dom.classList.contains('rect')) {
            this.pageEdit('rect')
        }
    },
    // 翻页：目标页索引值, 默认第一页
    page(index = 1) {
        if (!$(`#page${index}`)) return

        if (this.isOverView) {
            this.pageOverView(index)
            return
        }

        let curr = $('.page.curr')
        let id = curr.id.match(/\d+/)[0]

        let target = $(`.page#page${index}`)

        // 逆向入场
        if (index < id) {
            return this.animate(target, curr, false)
        }

        // 正向入场
        return this.animate(target, curr, true)
    },
    // 预览模式下的翻页
    pageOverView(index = 1) {

        if (!$(`#page${index}`)) return

        let w = document.body.clientWidth

        // 位移量, 这边的计算公式画了好久的图
        let d = 0
        if (this.doms.length % 2 === 0) {
            d = (this.doms.length / 2 - (index - 1)) * w - w / 2
        } else {
            d = (this.doms.length / 2 - (index - 1)) * w
        }

        this.dom.wrapper.style.transform = `translate(-50%, -50%) scale(0.3) scale(0.8) translateX(${d}px) translateY(0px)`;

        let curr = $('.page.curr')
        let target = $(`#page${index}`)
        curr.classList.toggle('curr', false)
        target.classList.toggle('curr', true)
    },
    // 翻页：上一页
    pagePrev() {

        let curr = $('.page.curr')
        let prev = curr.previousElementSibling
        let next = curr.nextElementSibling

        if (!prev) return


        console.log('pagePrev: ' + curr.id + '-->' + prev.id)

        if (this.isOverView) {
            let index = prev.id.match(/\d+/)[0]
            this.pageOverView(index)
        } else {
            this.animate(prev, curr, false)
        }

        // 箭头样式调整
        this.dom.control.left.classList.toggle('disabled', !prev.previousElementSibling)
        this.dom.control.right.classList.toggle('disabled', false)
    },
    // 翻页：下一页
    pageNext() {

        let curr = $('.page.curr')
        let prev = curr.previousElementSibling
        let next = curr.nextElementSibling

        if (!next) return

        console.warn('pageNext: ' + curr.id + '-->' + next.id)

        if (this.isOverView) {
            let index = next.id.match(/\d+/)[0]
            this.pageOverView(index)
        } else {
            this.animate(next, curr, true)
        }

        // 箭头样式调整
        this.dom.control.right.classList.toggle('disabled', !next.nextElementSibling)
        this.dom.control.left.classList.toggle('disabled', false)
    },
    // 页面绘图
    pageEdit(type) {
        let target = this.dom.control.edit
        if (type === 'rect') {
            target = this.dom.control.rect
        }

        this.isCanvasEnable = target.classList.toggle('active')

        if (this.isCanvasEnable) {
            document.body.classList.toggle('edit', true)
            return this.enableDraw(type)
        }

        // 否则关闭绘图模式
        this.disableDraw()
        document.body.classList.toggle('edit', false)
    },
    // 开关全屏模式
    toggleFullScreen(element) {
        // 普通元素
        if (element !== document.body) {
            return element.classList.toggle('fullscreen')
        }

        if (element.isFullScreen) {
            return this.exitFullscreen(element)
        }
        this.requestFullscreen(element)
    },
    requestFullscreen(element) {
        element.isFullScreen = true
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen();
        }
    },
    exitFullscreen(element) {
        element.isFullScreen = false
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    },
    // 开关全局预览
    toggleOverView() {

        this.isOverView = !this.isOverView
        this.dom.wrapper.classList.toggle('overview', this.isOverView)

        // 预览模式
        if (!this.isOverView) {
            this.dom.wrapper.style.width = "auto"
            this.dom.wrapper.style.transform = ""
            return
        }

        let w = document.body.clientWidth
        this.dom.wrapper.style.width = $$('.ppt .page').length * (w + 30) + 'px';

        // 计算父容器位移
        let index = $('.page.curr').id.match(/\d+/)[0]
        this.pageOverView(index)
    },
    /**
     * 退场入场动画
     * @param {dom} inDom 入场节点
     * @param {dom} outDom 退场节点
     * @param {boolean} isForwards 正向还是逆向, 默认正向
     */
    animate(inDom, outDom, isForwards = true) {

        let inAnimate = isForwards ? 'ani-in-next' : 'ani-in-prev'
        let outAnimate = isForwards ? 'ani-out-prev' : 'ani-out-next'

        // 退场动画
        outDom.classList.toggle(outAnimate, true)
        var outHandler = function () {
            console.log('ani-out end')
            outDom.classList.toggle(outAnimate, false)
            outDom.classList.toggle('curr', false)
            outDom.removeEventListener('animationend', outHandler)
        }
        outDom.addEventListener('animationend', outHandler)

        // 入场动画
        inDom.classList.toggle('curr', true)
        inDom.classList.toggle(inAnimate, true)
        var inHandler = function () {
            console.log('ani-in end')
            inDom.classList.toggle(inAnimate, false)
            inDom.removeEventListener('animationend', inHandler)
        }
        inDom.addEventListener('animationend', inHandler)
    },
    // 开启绘图模式
    enableDraw(type) {
        cvs.updateType(type)
        cvs.enable()
    },
    // 关闭绘图模式
    disableDraw() {
        cvs.disable()
        cvs.clear()
    },
    // url hash变动监听
    hashChange(e) {
        console.log(e)
        let index = location.hash.replace('#', '')
        this.page(index)
    },
    /**
     * 延迟加载函数 js / css文件
     * 
     * @param {string} url 目标地址, 可以是单独的地址, 也可以是一个地址的数组
     */
    lazyLoad(url) {
        if (!url) return
        if (!/(String|Array)/.test(url.constructor)) return

        url = url.constructor === String ? [url] : url
        let promises = []

        url.forEach(item => {
            let dom
            // 加载css
            if (/\.css$/.test(item)) {
                dom = document.createElement('style')
                dom.href = item
            }
            if (/\.js$/.test(item)) {
                dom = document.createElement('script')
                dom.src = item
            }

            promises.push(new Promise((resolve, reject) => {
                dom.onload = resolve
                document.body.appendChild(dom)
            }))
        })

        return Promise.all(promises)
    }
}

// 绘图相关的环境设置
window.cvs = {
    // 回调监听
    listeners: {},
    canvas: null,
    ctx: null,
    // 是否已开启
    isEnabled: false,
    isMouseDown: false,
    curColor: "#ff5722",
    curLoc: {
        x: 0,
        y: 0
    },
    lastLoc: {
        x: 0,
        y: 0
    },
    // canvas绘制类型，是矩形还是自由形状
    type: 'auto',
    init(canvas) {
        this.canvas = canvas
        canvas.width = document.body.clientWidth
        canvas.height = document.body.clientHeight
        this.canvasInfo = canvas.getBoundingClientRect()
        this.ctx = canvas.getContext('2d')
    },
    on(name, cb) {
        if (!name || !cb || cb.constructor !== Function) return
        this.listeners[name] = cb
    },
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    updateType(type) {
        this.type = type || 'auto'
    },
    // 根据窗口大小更新canvas大小
    updateWidthHeight() {
        let canvas = this.canvas
        if (document.body.isFullScreen) {
            canvas.width = window.screen.availWidth
            canvas.height = window.screen.availHeight
        } else {
            canvas.width = document.body.clientWidth
            canvas.height = document.body.clientHeight
        }

        console.warn('canvas reset: width ->' + canvas.width + ' height ->' + canvas.height)
    },
    // 开启
    enable() {
        this.isEnabled = true
        let canvas = this.canvas
        canvas.classList.toggle('active', true)

        // 不要重复绑定事件
        if (canvas.onmousedown) return

        canvas.onmousedown = function (e) {
            cvs.canvasMouseDown(e);
        };
        canvas.onmouseup = function (e) {
            e.preventDefault();
            console.log('mouse up');
            cvs.isMouseDown = false;
        };
        canvas.onmouseout = function (e) {
            e.preventDefault();
            console.log('mouse out');
            cvs.isMouseDown = false;
        };
        canvas.onmousemove = function (e) {
            cvs.canvasMouseMove(e);
        };
    },
    // 关闭
    disable() {
        this.isEnabled = false
        let canvas = this.canvas
        canvas.classList.toggle('active', false)
        canvas.onmousedown = null
        canvas.onmouseup = null
        canvas.onmouseout = null
        canvas.onmousemove = null
    },
    canvasMouseDown(e) {
        e.preventDefault();
        console.log('mouse down', e.clientX, e.clientY);
        this.updateLastLoc(e.clientX, e.clientY)
    },
    // 不绘图时候的touch方向
    arrow(key) {
        if (this.isCanvasEnable) return
        this.listeners['arrow'] && this.listeners['arrow'](key)
    },
    // 更新准备位置：绘图前的准备工作
    updateLastLoc(x, y) {
        this.isMouseDown = true;
        this.lastLoc = {
            x,
            y
        };
    },
    // 更新当前位置
    updateCurrLoc(x, y) {
        this.curLoc = {
            x,
            y
        };
    },
    canvasMouseUp(e) {
        e.preventDefault();
        console.log('mouse up');
    },
    canvasMouseMove(e) {
        e.preventDefault();
        if (!this.isMouseDown) {
            return;
        }
        console.log('mouse move', e.clientX, e.clientY);
        this.updateCurrLoc(e.clientX, e.clientY)
        this.draw();
    },
    draw() {
        if (!this.isEnabled) return
        if (!this.isMouseDown) return

        // 原始位置
        let last = this.getPosition(this.lastLoc.x, this.lastLoc.y);
        // 新的位置
        let { x, y } = this.getPosition(this.curLoc.x, this.curLoc.y);

        let ctx = this.ctx
        y += 30;
        last.y += 30

        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.curColor;
        ctx.globalAlpha = 0.7;

        // 开始绘制
        if (this.type === 'rect') {
            console.log('to x:' + x + ' y:' + y);
            this.clear()
            return ctx.strokeRect(last.x, last.y, x - last.x, y - last.y);
        }

        console.log('start x:' + x + ' y:' + y);
        // ctx.moveTo(x, y);
        ctx.lineTo(x, y);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        this.lastLoc = this.curLoc;
    },
    getPosition(x, y) {
        x = Math.floor(x - this.canvasInfo.left);
        y = Math.floor(y - this.canvasInfo.top);
        return ({
            x: (x < 0 || x > this.canvas.width ? -1 : x),
            y: (y < 0 || y > this.canvas.height ? -1 : y)
        });
    },
    getDistance(loc1, loc2) {
        var data = Math.sqrt((loc2.x - loc1.x) * (loc2.x - loc1.x) + (loc2.y - loc1.y) * (loc2.y - loc1.y));
        return data;
    }
}

// 移动端touch事件
window.touch = {
    isMouseDown: false,
    init() {
        document.addEventListener("touchstart", this.touchStart.bind(this), false);
        document.addEventListener("touchmove", this.touchMove.bind(this), false);
        document.addEventListener("touchend", this.touchEnd.bind(this), false);
    },
    touchStart(e) {
        e.preventDefault();
        var touches = event.touches[0];
        this.isMouseDown = true
        this.lastLoc = {
            x: touches.pageX,
            y: touches.pageY
        }
        cvs.updateLastLoc(touches.pageX, touches.pageY)
    },
    touchMove(e) {
        e.preventDefault();
        var touches = event.touches[0];
        this.currLoc = {
            x: touches.pageX,
            y: touches.pageY
        }
        if (!this.isMouseDown) return

        // 绘图模式
        if (cvs.isEnabled) {
            cvs.updateCurrLoc(touches.pageX, touches.pageY)
            cvs.draw()
            return
        }

        // 翻页模式, 需要防抖
        if (this.pageTimer) {
            console.warn('销毁 翻页 timer')
            clearTimeout(this.pageTimer)
        }
        this.pageTimer = setTimeout(() => {
            this.pageTimer = null
            console.log('------ 执行 翻页 ------')
            cvs.arrow(this.currLoc.x - this.lastLoc.x)
        }, 100)
    },
    touchEnd(e) {
        e.preventDefault();
        this.isMouseDown = false
        // var result = this.curLoc.x - this.lastLoc.x
    }
}