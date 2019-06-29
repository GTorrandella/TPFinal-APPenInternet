//Lado del cliente chat:

var socket = io.connect('/');
//Primero nos conectamos con el servidor (linea de arriba). Esto enviarà una request de conexiòn al servidor desde
//la pàgina que fue cargada. Tambien esto negociarà el protocolo de transporte que se utilizarà
//y finalmente dará como resultado que el evento "connection" se active (trigger) en la app del servidor.

socket.on('message', function (data) {
	data = JSON.parse(data);
	$('#messages').append('<div class="'+data.type+'">' + data.message + '</div>');
});
//Las lineas de arriba conectan el manejador de eventos para el evento "message"
//El mensaje que vendra tendremos que adjuntarlo (append) en el area de mensajes "messages".
//Ademàs seteamos la clase "class" para el nuevo tag "div" que agregaremos para que sea del mismo tipo al tipo del msje.
//Lo usaremos mas adelante para darle diferentes aspectos a los diferentes tipos de mensajes.

$(function(){  //cuando document (el html) estè listo...
	$('#send').click(function(){  //cuando clickeemos en el boton con id send...
		//Creamos un objeto data seteando en message el contenido de la caja de mensajes y en type el tipo de msje.
		var data = {
			message: $('#message').attr('name') +": " + $('#message').val(),
			type:'userMessage'
		};
		socket.send(JSON.stringify(data));   //Enviamos el objeto data anteriormente creado del Cliente al Servidor.
		//Y lo enviamos como string al usar JSON.stringify.

		//Y el servidor agarrarìa este msje con -->socket.on('message', function(message){

		$('#message').val(''); //jquery. val me asigna el valor.
	});
});

var xhtml = new XMLHttpRequest()
xhtml.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200){
        $("#message").attr("name", this.responseText)	
    }
}
xhtml.open("GET", "/userName", true)
xhtml.send()