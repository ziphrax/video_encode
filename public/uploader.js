$(function(){
    var socket = io();

    $ffmpegStatus = $('#ffmpegStatus');

    socket.on('disconnect',function(thisSocket){
        $ffmpegStatus.text('Socket Disconnected');
    });

    socket.on('progress',function(message){
        $ffmpegStatus.text(message);
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
            $ffmpegStatus.text('Uploading: ' + Math.floor(size / file.size * 100) + '%');
        });

        blobStream.on('end', function(chunk) {
            $ffmpegStatus.text('Upload Complete, Starting Encode...');
        });

        blobStream.pipe(stream);
    });

});
