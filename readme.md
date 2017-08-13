## :rabbit: webppt 演示框架
致力于打造一款轻量级web演示ppt框架(单页应用)

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
- [x] - 全局预览模式
- [x] - 图片全屏展示
- [x] - 浏览器全屏

[在线demo](https://ldodo.cc/webppt)

![运行效果](http://wx2.sinaimg.cn/mw1024/74d94e2egy1fig9p5w8bkj212h0kzjxm.jpg)


### 开发步骤
1. 引入脚本 `ppt.js`, 样式 `ppt.css`
2. 按照下面的流程引入标签
3. 静态文件托管服务: node server.js

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

// js
ppt.init()
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
ppt.init()
```

### 快捷键说明
+ ppt切换: pc -> 左右箭头切换ppt
+ ppt切换: touch -> 左右滑动切换ppt
+ 绘图模式: pc -> 字母b：进入、退出绘图模式
+ 全局预览: pc -> 字母o 、Enter键：进入、退出全局预览模式
+ 浏览器全屏: pc -> F11 进入全屏

### 目前问题
1. mac chrome转场动画不太友好，浏览器重绘问题
2. canvas 绘图位置不太准确
