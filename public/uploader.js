$(function(){
    var socket = io();
    var strIcon = '<i class="glyphicon glyphicon-file"></i>&nbsp;';

    $ffmpegStatus = $('#ffmpegStatus');

    socket.on('disconnect',function(thisSocket){
        $ffmpegStatus.html('Socket Disconnected');
    });

    socket.on('update file list',function(fileList){
        $('.video-list ul').html('');
        $.each(fileList,function(index,val){
            $('.video-list ul').append(
                '<li class="list-group-item" data-id="'+ index +'">' + val +'<a href="#"><i class="glyphicon glyphicon-remove pull-right"></i></a></li>'
            );
        });
    });

    $('.video-list ul').on('click','li',function(e){
        e.preventDefault();

        socket.emit('remove file',$(this).data('id'));

        return false;
    });

    socket.on('progress',function(message){
        $ffmpegStatus.html(strIcon + message);
    });

    $('#file').change(function(e) {
        var file = e.target.files[0];
        var stream = ss.createStream();

        // upload a file to the server.
        ss(socket).emit('media upload', stream, {size: file.size, name: file.name});

        var blobStream = ss.createBlobReadStream(file);

        //track status
        var size = 0;
        blobStream.on('data', function(chunk) {
            size += chunk.length;
            $ffmpegStatus.html(strIcon + 'Uploading: ' + Math.floor(size / file.size * 100) + '%');
        });

        blobStream.on('end', function(chunk) {
            $ffmpegStatus.html(strIcon + 'Encoding...');
        });

        blobStream.pipe(stream);
    });

});
