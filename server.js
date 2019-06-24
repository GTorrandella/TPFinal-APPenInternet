const http = require('http')
const fs = require('fs')
const validation = require('./validation.js')
const {check, validationResult} = require('express-validator/check');

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

function register_user(user_data){
  if (user_data.confirmation_password != user_data.password){
    return res.status(422)
  }
  else{

  }
}

// Devuelve por defecto la página de login
aplicacion.get('/', function(req, res){
	var text = fs.readFileSync("index.html").toString();
	res.send(text);
})

aplicacion.post('/', [
  // username must be an email
  check('email')
      .isEmail(),
  // password must be at least 5 chars long
  check('password')
      .isLength({ min: 5 })
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log(req.body)
    
    if (req.body.confirmation_password){
      console.log("NUEVO USUARIO")
    }
    else{
      console.log("VIEJO USUARIO")
    }

    res.send("Llegó el POST")
})

// Pone a escuchar al servidor y avisa por consola cuando esta listo
port = 8080
hostname = "localhost"
server.listen(port, hostname, () => {
    console.log(`Stream server running at http://${hostname}:${port}/`);
});