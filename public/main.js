const socket = io()


const clientsTotal = document.getElementById('clients-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const messageTone = new Audio('/messageTune.mp3')
const fileSend = document.getElementById('sendPicture')

messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    sendMessage()
})

socket.on('clients-total',(data) =>{
    clientsTotal.innerText = `Availabe User: ${data}`
})


function sendMessage(){
    if(messageInput.value === '') return
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    }
    socket.emit('message',data)
    addMessageToUI(true,data)
    messageInput.value = ''
}

socket.on('chat-message',(data) =>{
    messageTone.play();
    addMessageToUI(false,data)
})

function addMessageToUI(isOwnMessage,data){
    clearFeedback()
    const element = `
        <li class = "${isOwnMessage ? 'message-right' : 'message-left'}">
                <p class="message">
                    ${data.message}
                    <span>${data.name} ● ${moment(data.dateTime).fromNow()}
                    </span>
                </p>
            </li>
            `       

    messageContainer.innerHTML += element;
    scrollToBottom()
}


function scrollToBottom(){
    messageContainer.scrollTo(0,messageContainer.scrollHeight)
}

messageInput.addEventListener('focus',(e) =>{
    socket.emit('feedback',{
        feedback: `${nameInput.value} is typing a message`
    })
})


messageInput.addEventListener('keypress',(e) =>{
    socket.emit('feedback',{
        feedback: `${nameInput.value} is typing a message`
    })
})
messageInput.addEventListener('blur',(e) =>{
    socket.emit('feedback',{
        feedback: ''
    })
})

socket.on('feedback',(data) =>{
    clearFeedback()
    const element = `
        <li class="message-feedback">
            <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
            `

    messageContainer.innerHTML += element;
})


function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(element =>{
        element.parentNode.removeChild(element)
    })
}


//send file
socket.on('addimage', function (user, myImage, myFile) {
    scrollToBottom();
    $('#imgShow').append('<p><b>' + nameInput.value + ': </b>' + '<img width="200" height="200" style="border-radius:10px" src="' + myImage + '" /><br><small>' + moment().format('h:mm a')+'</small></p>');
})
$(function () {
    $('#sendPicture').on('change', function (e) {
        var file = e.originalEvent.target.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            socket.emit('userImage', evt.target.result);
        };
        reader.readAsDataURL(file);
        messageTone.play();
    })
})

var uploader = new SocketIOFileClient(socket);
var form = document.getElementById("message-form");
uploader.on("start", function (fileInfo) {
  console.log("Start uploading", fileInfo);
});
uploader.on("stream", function (fileInfo) {
  console.log("Streaming... sent " + fileInfo.sent + " bytes.");
});
uploader.on("complete", function (fileInfo) {
  console.log("Upload Complete", fileInfo);
  $('#message-container').append(`<li class="message-container active"> ${fileInfo.originalFileName}</li>`);
    scrollToBottom()
});
uploader.on("error", function (err) {
  console.log("Error!", err);
});
uploader.on("abort", function (fileInfo) {
  console.log("Aborted: ", fileInfo);
});

$("#sendPicture").click(() => {
    $("#fileInput").trigger("click");
  });
  $("#fileInput").change(() => {
    var fileEl = document.getElementById("fileInput");
    var uploadIds = uploader.upload(fileEl);
  });
