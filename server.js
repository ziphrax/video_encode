var express = require('express')
    app = express(),
    server = require('http').createServer(app);
    ffmpeg = require('fluent-ffmpeg'),
    command = ffmpeg(),
    multer = require('multer'),
    upload = multer({ dest: 'tmp/video' }),

    io = require('socket.io').listen(server),
    fs = require('fs'),
    server_port = 3000;


app.set('view engine','ejs');

app.use(express.static('public'));

io.on('connection',function(socket){
    console.log('socket connected');
    socket.emit('progress', 'Connected');

    socket.on('disconnect',function(){
        console.log('socket disconnected');
    });
});

app.get('/',function(req,res){
    fs.readdir( __dirname + "/uploads/",function(err,files){
        if(err){
            res.render('error',{error: err});
        } else {
            res.render('index',{files:files});
        }
    });
});

app.post('/video_upload', upload.single('video'), function (req, res, next) {
    fs.readFile(req.file.path,function(err,data){
        var newPath = __dirname + "/tmp/uploads/" + req.file.originalname;
        var stream  = fs.createWriteStream(__dirname + req.file.originalname);
        fs.writeFile(newPath,data,function(err){
            if(err){
                res.render('error',{error: err});
            } else {
                console.log('video file written: ' + newPath );
                ffmpeg(newPath)
                .output(req.file.originalname)
                .on('progress', function(progress) {
                    io.sockets.emit('progress','ffmpeg ' + progress.percent + '% done');
                    console.log('ffmpeg ' + progress.percent + '% done');
                 })
                 .on('error', function(err, stdout, stderr) {
                     io.sockets.emit('progress','Cannot process video: ' + err.message);
                     console.log('Cannot process video: ' + err.message);
                 })
                 .on('end',function(){
                     io.sockets.emit('progress','finished');
                     console.log('ffmpeg done.');
                 }).size('320x200')
                  .run();
                res.json({'status':'success'});
            }
        });
    });
});

server.listen(server_port,function(){
    console.log('video_enc app listening...');
});
