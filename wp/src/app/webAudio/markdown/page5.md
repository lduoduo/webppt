## 代码展示

### by dodo

`getUserMedia` 允许网页中的js脚本直接捕捉摄像头、麦克风，代码如下
```
let constrant = {audio:true}
navigator.mediaDevices.getUserMedia(constrant).then(function (stream) {
    mylocalVideo = stream
    window.anode = document.createElement('video')
    anode.srcObject = stream
    anode.controls = true
    anode.play()
    document.body.appendChild(anode)
}).catch((e) => {
    let error = `启动摄像头失败: ${e.name}`
    console.log(e)
})
```