var express = require('express')
    app = express(),
    server = require('http').createServer(app);
    ffmpeg = require('fluent-ffmpeg'),
    command = ffmpeg(),
    path = require('path'),
    io = require('socket.io').listen(server),
    ss = require('socket.io-stream'),
    fs = require('fs'),
    server_port = 3000;


app.set('view engine','ejs');

app.use(express.static('public'));

io.on('connection',function(socket){
    console.log('socket connected');
    socket.emit('update file list',getFiles(__dirname+'/tmp/video/'));

    socket.on('disconnect',function(){
        console.log('socket disconnected');
    });

    socket.on('remove file',function(index){
        console.log('Remove File: '+index);
        fs.unlinkSync(__dirname+'/tmp/video/' + index);
        socket.emit('update file list',getFiles(__dirname+'/tmp/video/'));
    });

    ss(socket).on('media upload', function(stream,file) {
        console.log('New media uploading...');

        stream.on('end',function(evt){
            ffmpeg(__dirname+'/tmp/uploads/' + file.name)
            .output(__dirname+'/tmp/video/' + file.preset + '_' + file.name )
            .preset(file.preset)
            .on('progress', function(progress) {
                socket.emit('progress','Progress: ' +  Math.floor(progress.percent) + '%');
                console.log('ffmpeg ' +  Math.floor(progress.percent) + '% done');
             })
             .on('error', function(err, stdout, stderr) {
                 socket.emit('progress','ffmpeg Cannot process video: ' + err.message);
                 console.log('Cannot process video: ' + err.message);
             })
             .on('end',function(){
                 socket.emit('progress','Finished!');
                 socket.emit('update file list',getFiles(__dirname+'/tmp/video/'));
                 console.log('ffmpeg done!');
             })
            .run();

        }).pipe(fs.createWriteStream(__dirname+'/tmp/uploads/' + file.name));
    });
});

app.get('/',function(req,res){
    res.render('index');
});

server.listen(server_port,function(){
    console.log('video_enc app listening...');
});

function getFiles(path){
    return fs.readdirSync(path);
}
