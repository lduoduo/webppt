/**
 * ppt演示框架源码
 * created by lduoduo on 2017-08-11
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
    dom: {},
    _tpl: {
        arrow: '<aside class="controls"><a class="edit"></a><a class="arrow left"></a><a class="arrow right"></a></aside>'
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
        this.init()
        this.initEvent()
        this.initCanvas()
    },
    // 初始化环境
    init() {
        let doms = $$('.ppt .page')
        doms[0].classList.add('curr')
        doms[1] && doms[1].classList.add('next')

        // 如果ppt张数多余1，显示箭头
        if (doms.length > 1) {
            let control = document.createElement('div')
            control.innerHTML = this._tpl.arrow
            document.body.appendChild(control)
        }
    },
    // 事件注册
    initEvent() {
        this.dom.control = $('.controls')
        this.dom.control.left = $('.controls .left')
        this.dom.control.right = $('.controls .right')
        this.dom.control.addEventListener('click', this.clickControl.bind(this))
    },
    // 初始化canvas环境
    initCanvas() {
        let canvas = this.dom.canvas = document.createElement('canvas')
        canvas.className = "pageEditor"
        canvas.width = window.screen.availWidth;
        canvas.height = window.screen.availHeight;

        document.body.appendChild(canvas)

        cvs.init(canvas)
    },
    // 箭头事件
    clickControl(e) {
        let dom = e.target
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

        curr.classList.toggle('curr', false)
        prev.classList.toggle('curr', true)

        // 箭头样式调整
        this.dom.control.left.classList.toggle('disabled', !prev.previousElementSibling)
        this.dom.control.right.classList.toggle('disabled', false)
    },
    // 翻页：下一页
    pageNext() {
        let curr = $('.page.curr')
        let next = curr.nextElementSibling

        curr.classList.toggle('curr', false)
        next.classList.toggle('curr', true)

        // 箭头样式调整
        this.dom.control.right.classList.toggle('disabled', !next.nextElementSibling)
        this.dom.control.left.classList.toggle('disabled', false)
    },
    // 页面标注
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
    clear(){
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
        // ctx.lineWidth = 10;

        ctx.lineWidth = (this.curLoc.t / this.curLoc.d * 3 > 10 ? 10 : this.curLoc.t / this.curLoc.d * 10);
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