const http = require('http')
const fs = require('fs')
const {check, validationResult} = require('express-validator/check');
const uuid = require('uuid-random');

// Requiero el encriptado, y declaro las rondas que usará al hashear
const bcrypt = require('bcrypt')
saltRounds = 10

// Requiero Express
const express = require('express')
var aplicacion  = express()

//  Creo el servidor http a partir de Express
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

// Genero el manejador de sesiones de express
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
 
app.use(session({
    store: new RedisStore(client=redisDB),
    secret: 'keyboard cat',
    resave: false
}));


function add_user(user_data){
  redisDB.set("user:"+user_data.email, user_data.name)
  bcrypt.hash(user_data.password, saltRounds, function(err, hash) {
    redisDB.set("pass:"+user_data.email, hash)
  })  
}

function check_registration_data(user_data){
  if (user_data.confirmation_password != user_data.password){
    return false
  }
  return true
}

function check_returning_user(user_data){
  bcrypt.compare(user_data.password, redisDB.get("pass:"+user_data.email), function(err, res) {
    if (res){
      return true
    }
    return false
  })
}

// Devuelve por defecto la página de login
aplicacion.get('/', function(req, res){
  console.log(req.cookies)
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
      if ('email' in errors.mapped()) {res.send(fs.readFileSync("html/index-regis-email.html").toString())}
      else if ('password' in errors.mapped()) {res.send(fs.readFileSync("html/index-regis-pass-short.html").toString())}
    }
    
    else if (req.body.confirmation_password){
      if (check_registration_data(req.body)){
        add_user(req.body)
        res.status(200)
      }
      else res.send(fs.readFileSync("html/index-regis-pass.html").toString())
    }
    else{
      if (check_returning_user(req.body)){
        res.status(200)
      }
      else {
        res.send(fs.readFileSync("html/index-login-email.html").toString())
      }
    }

    res.send()
})

// Pone a escuchar al servidor y avisa por consola cuando esta listo
port = 8080
hostname = "localhost"
server.listen(port, hostname, () => {
    console.log(`Stream server running at http://${hostname}:${port}/`);
});