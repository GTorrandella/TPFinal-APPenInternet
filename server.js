const http = require('http')
const fs = require('fs')
const validation = require('./validation.js')
const validationResult = require('express-validator/check/validation-result');

// Requiero Express, luego creo el servidor http a partir de Express
const express = require('express')
var aplicacion  = express()
aplicacion.use(express.urlencoded({extended : true}))
aplicacion.use(express.static(__dirname + '/css'))
aplicacion.use(express.static(__dirname + '/html'))
aplicacion.use(express.static(__dirname + '/images'))
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


// Devuelve por defecto la página de login
aplicacion.get('/', function(req, res){
	var text = fs.readFileSync("index.html").toString();
	res.send(text);
})


aplicacion.post('/', validation.old_user, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log(req.body)
    res.send("Llegó el POST")
})

// Pone a escuchar al servidor y avisa por consola cuando esta listo
port = 8080
hostname = "localhost"
server.listen(port, hostname, () => {
    console.log(`Stream server running at http://${hostname}:${port}/`);
});