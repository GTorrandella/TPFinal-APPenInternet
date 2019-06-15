const http = require('http')
const fs = require('fs')

// Requiero Express, luego creo el servidor http a partir de Express
const express = require('express')
var aplicacion  = express()	
var server = http.createServer(aplicacion)

// Bindeo el servidor http con Socket.IO
const io = require('socket.io').listen(server);
aplicacion.set('view engine', 'ejs');

// Conecto el server a Redis
const redis = require('ioredis')
var connectionParameters = {
    port : 6379,
    host : 'localhost'
}
var redisDB = new redis(connectionParameters)


// Devuelve por defecto la página de login común
aplicacion.get('/', function(req, res){
    var fs = require("fs");
	var text = fs.readFileSync("index.html").toString();
	res.send(text);
})

aplicacion.post('/', function(req, res){
    console.log(req.body)
    res.send("Llegó el POST")
})

// Pone a escuchar al servidor y avisa por consola cuando esta listo
port = 8080
hostname = "localhost"
server.listen(port, hostname, () => {
    console.log(`Stream server running at http://${hostname}:${port}/`);
});