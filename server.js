//server
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
app.use('/',express.static(__dirname + '/www'));

server.listen(3000);

//socket
io.on('connection',function(socket){
    socket.on('login',function(nickname){
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname,users.length,'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    })

    socket.on('disconnect',function(){
        users.splice(socket.userIndex,1);
        socket.broadcast.emit('system',socket.nickname,users.length,'logout');
    })

     //接收新消息
    socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });

    //接收用户发来的图片
    socket.on('img', function(imgData) {
    //通过一个newImg事件分发到除自己外的每个用户
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });

})