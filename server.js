'use strict';
var koa = require('koa');
var app = koa();

var fs = require('fs');

var statics = require('koa-static');
var mount = require('koa-mount');
// var serve = require('koa-serve');

var a = koa();
/** Access-Control-Allow-Origin */
var cors = require('koa-cors');

var staticPort = 9090

app.use(cors());

/** static file folder */
// app.use(serve('/static', __dirname + '/public/app/dest/'));
// app.use(mount('/static', statics(__dirname + '/public/app/dest/')));
a.use(statics(__dirname + '/dist/'));
app.use(mount('/webppt', a));
// app.use(statics(__dirname + '/public/app/dest/'));

app.listen(staticPort);

console.log(`server on ${staticPort}`)