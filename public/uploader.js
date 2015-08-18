$(function(){
    var socket = io();

    $ffmpegStatus = $('#ffmpegStatus');
    
    $('#uploadForm').submit(function(e){
        e.preventDefault;
        $(this).ajaxSubmit({

          error: function(xhr) {
            status('Error: ' + xhr.status);
          },

          success: function(response) {
            $ffmpegStatus.text('File Upload: ' + response.status);
          }
      });
      return false;
    });

    socket.on('connection',function(thisSocket){
        $ffmpegStatus.text('Socket Connected');
    });

    socket.on('disconnect',function(thisSocket){
        $ffmpegStatus.text('Socket Disconnected');
    });


    socket.on('progress',function(data){
        $ffmpegStatus.text(data);
    });
});
