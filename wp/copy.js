/**
 * 文件copy，从src到目标路径
 */
// const os = require('os');
const path = require("path");

const co = require('co');
const tool = require('./utils.js');

/** 获取模板路径 */
var srcPath = path.join(__dirname, "./src/index.html");
/** 获取destPath前缀 */
var destPath = "../dist";
/** 获取系统类型 */
var sys = process.platform; //或者使用node API ： os.type();
/** 脚本命令 */
var ls = null;

console.log();

co(init);

function* init(){

	destPath = path.join(__dirname, destPath);

	var status = yield tool.checkDir(destPath);

	if(!status){
		//拷贝文件
		if (/win32/gi.test(sys)) {

			yield tool.cmdFileCopy(srcPath, destPath);

		} else {

			yield tool.lsFileCopy(srcPath, destPath);

		}

		console.log(`文件copy成功: ${destPath}`);

	} else {

        console.log(status)
    }

}