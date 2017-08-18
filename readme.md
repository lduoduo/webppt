## :rabbit: webppt 演示框架
致力于打造一款轻量级web演示ppt框架(单页应用)

[在线demo](https://ldodo.cc/webppt)

### 起步
2017-08-11 by duoduo

### 目标核心功能
1. markdown 转html
2. 转场动画
3. 做笔记、画图
4. 兼容移动端
5. [源码地址](https://github.com/lduoduo/webppt/blob/master/wp/src/lib/ppt.js)

### 已实现功能
- [x] - markdown转html
- [x] - 转场动画
- [x] - 绘图模式
- [x] - 全景模式
- [x] - 图片全屏展示
- [x] - 浏览器全屏
- [x] - 进度条更新
- [x] - touch端切换ppt
- [x] - touch端全景预览
- [x] - touch端开启debug日志


![运行效果](http://wx2.sinaimg.cn/mw1024/74d94e2egy1fig9p5w8bkj212h0kzjxm.jpg)

### 目录结构 - 工具说明
+ webpack3 打包目录
+ ppt.js源文件目录[wp-ppt](https://github.com/lduoduo/webppt/tree/master/wp/src/lib)
+ demo源文件[wp-demo](https://github.com/lduoduo/webppt/tree/master/wp/src/app)
+ 新ppt工程请在上面的目录下新建文件夹，存放业务js / scss / less
+ 具体目录说明如下

```
webppt
├── readme.md
├── package.json
├── .gitignore
└── wp
    └── wp.dev.js // build demo
    └── wp.sdk.js // build ppt.js / ppt.css
    └── utils.js // tools
    └── src
        └── app // demo folder
            └── demo 
        └── img // images
        └── lib // source code of ppt.js
        └── index.html // home page
```

### 开发步骤
1. 引入脚本 `ppt.js`, 样式 `ppt.css`
2. 按照下面的流程引入标签
3. 静态文件托管服务: node server.js
4. 开发命令
```
npm run dev
// 开启demo编译
npm run sdk
// 开启开发模式ppt.js编译
npm run sdk-build
// 开启生产模式ppt.js编译
```

### 引用标签详解

1. html里body需要加上类名`ppt`

2. 普通新幻灯片需要如下包裹头
```
// html
<div class="page">
    <section>
        <h1>用于首页的大写标题</h1>
        <h2>用于每张ppt的幻灯片标题</h2>
        <h3>副标题</h3>
        。。。其他内容
    </section>
</div>

// js 初始化ppt
ppt.init()
// 初始化完毕的回调
ppt.on('ready', () => {
    console.log('ready')
})
// 特殊幻灯片退场、入场后的回调
ppt.onPage('pageid', (e) => {
    console.log('pageid: ' + e)
})
```

3. markdown文件插入格式(需要开启webpack编译)
    + npm run dev
```
// html
<div class="page" name="markdown" data-template="markdown.md" ></div>

// js 嵌入markdown
ppt.markdown({
    'markdown.md': require('./markdown/markdown.md')
})
// js 初始化ppt
ppt.init()
```

### 快捷键说明
+ ppt切换: pc -> 左右箭头切换ppt
+ ppt切换: touch -> 左右滑动切换ppt
+ 绘图模式: pc -> 字母b：进入、退出绘图模式
+ 全景预览: pc -> 字母o 、Enter键：进入、退出全景预览模式
+ 全屏: pc -> F11 进入全屏

### 目前问题
1. mac chrome转场动画不太友好，浏览器重绘问题
2. canvas 绘图位置不太准确
