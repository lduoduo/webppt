/**
 * ppt演示框架源码
 * created by lduoduo on 2017-08-11
 * last updated by lduoduo on 2017-08-12
 * 
 * 说明(目标功能，待完善):
 * 1. 键盘事件:
 *      - 左右箭头切换上一页、下一页
 *      - 字母b: 开启、关闭绘图模式
 *      - 字母n: 开启、关闭注释弹框
 *      - 字母o: 开启、关闭全局预览模式
 * 2. 回调注册:
 *      - ppt.on('ready', cb) // ppt准备就绪的回调
 *      - ppt.on('before')
 * 3. 自定义键盘事件注册:
 *      - ppt.onKeydown('pageid','keycode',cb) // 页面id, 键盘code, 回调
 * 4. 自定义转场事件回调
 *      - ppt.onPage('pageid', cb) // 页面id, 回调(回调里面会传递参数 in / out)
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
    // 回调监听
    listeners: {},
    // 自定义键盘事件
    keyEvents: {},
    // 自定义dom事件
    domEvents: {},
    dom: {},
    _tpl: {
        arrow: '<a class="edit"></a><a class="arrow left"></a><a class="arrow right"></a>'
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
    // 发送回调
    emit(type, name, data) {
        if (!type) return
        this[type] && this[type][name] && this[type][name](data)
    },
    // 初始化环境
    init() {
        let doms = $$('.ppt .page')
        doms[0].classList.add('curr')
        doms[1] && doms[1].classList.add('next')

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
    },
    // 初始化控制UI
    initControl() {
        let control = this.dom.control = document.createElement('aside')
        control.className = 'ppt-controls'
        control.innerHTML = this._tpl.arrow
        document.body.appendChild(control)

        this.dom.control.left = $('.ppt-controls .left')
        this.dom.control.right = $('.ppt-controls .right')
        this.dom.control.addEventListener('click', this.clickControl.bind(this))
    },
    // 鼠标事件注册
    initEvent() {

    },
    // 键盘事件注册
    initKeyEvent() {
        document.body.addEventListener('keydown', (e) => {
            // console.log(e)
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
        let userEvent = `${pageid}_${keycode}`
        if (this.keyEvents[userEvent]) {
            return this.emit('keyEvents', userEvent);
        }

        // 默认事件: 左箭头
        if (keycode === 37) {
            return this.pagePrev()
        }
        // 默认事件: 右箭头
        if (keycode === 39) {
            return this.pageNext()
        }
        // 默认事件: 开关绘图模式
        if (keycode === 66) {
            return this.pageEdit()
        }
    },
    // 自定义键盘事件
    onKeydown(pageid, keycode, cb) {
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
            this.pageEdit()
        }
    },
    // 翻页：上一页
    pagePrev() {
        let curr = $('.page.curr')
        let prev = curr.previousElementSibling
        let next = curr.nextElementSibling

        if (!prev) return

        let pPrev = prev.nextElementSibling

        if (next) {
            next.classList.toggle('next', false)
        }
        if (pPrev) {
            pPrev.classList.toggle('prev', true)
        }

        // 出场动画
        curr.classList.toggle('ani-out-next', true)
        var outHandler = function () {
            console.log('ani-out end')
            curr.classList.toggle('ani-out-next', false)
            curr.classList.toggle('curr', false)
            curr.classList.toggle('prev', false)
            curr.classList.toggle('next', true)
            curr.removeEventListener('animationend', outHandler)
        }
        curr.addEventListener('animationend', outHandler)

        prev.classList.toggle('prev', false)
        prev.classList.toggle('curr', true)

        // 入场动画
        prev.classList.toggle('ani-in-prev', true)
        var inHandler = function () {
            console.log('ani-in end')
            prev.classList.toggle('ani-in-prev', false)
            prev.removeEventListener('animationend', inHandler)
        }
        prev.addEventListener('animationend', inHandler)

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

        let nNext = next.nextElementSibling

        if (prev) {
            prev.classList.toggle('prev', false)
        }
        if (nNext) {
            nNext.classList.toggle('next', true)
        }

        // 出场动画
        curr.classList.toggle('ani-out-prev', true)
        var outHandler = function () {
            console.log('ani-out end')
            curr.classList.toggle('ani-out-prev', false)
            curr.classList.toggle('curr', false)
            curr.classList.toggle('prev', true)
            curr.classList.toggle('next', false)
            curr.removeEventListener('animationend', outHandler)
        }
        curr.addEventListener('animationend', outHandler)

        next.classList.toggle('curr', true)
        next.classList.toggle('next', false)
        next.classList.toggle('prev', false)

        // 入场动画
        next.classList.toggle('ani-in-next', true)
        var inHandler = function () {
            console.log('ani-in end')
            next.classList.toggle('ani-in-next', false)
            next.removeEventListener('animationend', inHandler)
        }
        next.addEventListener('animationend', inHandler)

        // 箭头样式调整
        this.dom.control.right.classList.toggle('disabled', !next.nextElementSibling)
        this.dom.control.left.classList.toggle('disabled', false)
    },
    // 页面绘图
    pageEdit() {
        this.dom.canvas.classList.toggle('active')
        document.body.classList.toggle('edit')
        // 开启绘图模式
        if (this.dom.canvas.classList.contains('active')) {
            return this.enableDraw()
        }

        // 否则关闭绘图模式
        this.disableDraw()
    },
    // 开启绘图模式
    enableDraw() {
        let canvas = this.dom.canvas

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
    // 关闭绘图模式
    disableDraw() {
        let canvas = this.dom.canvas
        cvs.clear()
        canvas.onmousedown = null
        canvas.onmouseup = null
        canvas.onmouseout = null
        canvas.onmousemove = null
    }
}

// 绘图相关的环境设置
let cvs = {
    isMouseDown: false,
    curColor: "green",
    lastTime: null,
    curTime: null,
    curLoc: {
        x: 0,
        y: 0
    },
    lastLoc: {
        x: 0,
        y: 0
    },
    init(canvas) {
        this.canvas = canvas
        this.canvasInfo = canvas.getBoundingClientRect()
        this.ctx = canvas.getContext('2d')
    },
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    canvasMouseDown(e) {
        e.preventDefault();
        console.log('mouse down', e.clientX, e.clientY);
        this.isMouseDown = true;
        this.lastLoc = {
            x: e.clientX,
            y: e.clientY
        };
        this.lastTime = (new Date()).getTime();
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
        this.curLoc = {
            x: e.clientX,
            y: e.clientY
        };
        this.curTime = (new Date()).getTime();
        this.draw();
    },
    draw() {
        this.curLoc.t = this.curTime - this.lastTime;
        this.curLoc.d = this.getDistance(this.lastLoc, this.curLoc);
        let { x, y } = this.getPosition(this.curLoc.x, this.curLoc.y);
        let ctx = this.ctx
        y = y + 100;
        console.log('start x:' + x + ' y:' + y);
        ctx.beginPath();
        // ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.lineWidth = 10;

        // ctx.lineWidth = (this.curLoc.t / this.curLoc.d * 3 > 10 ? 10 : this.curLoc.t / this.curLoc.d * 10);
        ctx.strokeStyle = this.curColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        this.lastLoc = this.curLoc;
        this.lastTime = this.curTime;
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