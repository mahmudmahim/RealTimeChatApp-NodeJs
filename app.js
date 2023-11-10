const { Socket } = require('dgram');
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const multer = require('multer');
const SocketIOFile = require("socket.io-file");
const uuid = require("uuid");
const PORT = process.env.PORT || 4000
const server = app.listen(PORT,() => console.log(`💬 server on port ${PORT}`))

const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'))

let socketConnected = new Set()

io.on('connection',onConnected)

function onConnected(socket){
    socketConnected.add(socket.id)
    io.emit('clients-total',socketConnected.size)



    socket.on('disconnect', () => {
        socketConnected.delete(socket.id)

        io.emit('clients-total',socketConnected.size)
    })

    socket.on('message',(data) =>{
        socket.broadcast.emit('chat-message',data)
    })

    socket.on('feedback',(data) =>{
        socket.broadcast.emit('feedback',data)
    })

    //file upload
    socket.on('userImage', function(image,data){
        io.sockets.emit('addimage', socket.name,image);
    });

    var uploader = new SocketIOFile(socket, {
        uploadDir: "public\\data", // simple directory
        accepts: [
             "audio/mpeg",
             "video/x-msvideo",
             "video/webm",
             "audio/mp3",
             "image/jpeg",
             "image/png",
             "image/gif",
             "application/pdf",
             "application/msword",
             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
             "application/vnd.ms-powerpoint",
             "application/vnd.openxmlformats-officedocument.presentationml.presentation",
             "application/rtf",
             "application/vnd.rar",
             "text/plain",
             "application/zip",
             "application/x-zip-compressed"
        ], // chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
        maxFileSize: 4194304, // 4 MB. default is undefined(no limit)
        chunkSize: 10240, // default is 10240(1KB)
        transmissionDelay: 0, // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
        overwrite: false,
        rename: function (filename, fileInfo) {
             var file = path.parse(filename);
             var fname = uuid.v4(); // file.name;
             var ext = file.ext;
             return `${fname}${ext}`;
        }, // overwrite file if exists, default is true.
   });
   uploader.on("start", (fileInfo) => {
    console.log("Start uploading");
    console.log(fileInfo);
});
uploader.on("stream", (fileInfo) => {
    console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
});
uploader.on("complete", (fileInfo) => {
    console.log("Upload Complete.");
    console.log(fileInfo);
});















    // //configuring multer for file uploads

    // const storage = multer.diskStorage({
    //     destination: (req,file,cb) =>{
    //         cb(null,'uploads/');
    //     },
    //     filename: (req,file,cb) =>{
    //         const timestamp = Date.now();
    //         cb(null,`${timestamp}-${file.originalname}`);
    //     },
    // });

    // //file upload
    // const uploads = multer({storage});

    // socket.on('userImage', (data) => {
    //     const filename = `uploads/${data.name}`;
    //     fs.writeFileSync(filename, data.buffer);
    //     io.emit('addimage', { name: data.name, url: filename });
    //   });

    // socket.on('userImage',(data) =>{
    //     const fileName = `uploads/${data.name}`;
    //     fs.writeFileSync(fileName,data.buffer);
    //     io.emit('addimage',{name:data.name,url:fileName})
    // })

}