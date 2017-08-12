## ppt.js
致力于打造一款轻量级web演示ppt框架(单页应用)

### 目标核心功能
1. markdown 转html
2. 转场演示
3. 做笔记、画图

### 起步
2017-08-11 by duoduo

[在线demo](https://ldodo.cc/webppt)
![运行效果](http://wx2.sinaimg.cn/mw1024/74d94e2egy1fig9p5w8bkj212h0kzjxm.jpg)


### 开发步骤
1. 引入脚本 `ppt.js`, 样式 `ppt.css`
2. 按照下面的流程引入标签

### 引用标签详解

1. 普通新幻灯片需要如下包裹头
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

2. markdown文件插入格式(需要开启webpack编译)
```
// html
<div class="page" name="markdown" data-template="markdown.md" ></div>

// js 嵌入markdown
ppt.markdown({
    'markdown.md': require('./markdown/markdown.md')
})
```

### 目前问题
1. 转场动画不太友好，浏览器重绘问题