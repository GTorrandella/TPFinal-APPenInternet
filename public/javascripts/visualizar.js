//Simplemente si escuchamos el evento "stream" la image que nos llege la adjuntaremos en el src de la img de "visualizar.html"
var socket = io();
socket.on('stream',function(image){
	var img = document.getElementById("play");
	img.src=image;
	//SI quisieramos imprimir lo que llega cada 70ms: $("#logger").text(image);
});
