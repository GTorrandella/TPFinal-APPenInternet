const http = require('http')
const fs = require('fs')
const {check, validationResult} = require('express-validator');
const uuid = require('uuid-random');

// Requiero Express
const express = require('express')
var aplicacion  = express()

//  Creo el servidor http a partir de Express
aplicacion.use(express.urlencoded({extended : true}))
aplicacion.use(express.static(__dirname + '/css'))
aplicacion.use(express.static(__dirname + '/html'))
aplicacion.use(express.static(__dirname + '/images'))
aplicacion.use(express.static(__dirname + '/public'))
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
 
aplicacion.use(session({
    secret: 'tp-final',
    resave: false,
    genid: function(){
      return uuid()
    },
    saveUninitialized: true
}));

aplicacion.use(function(req, res, next) {
  console.log("Nueva session")
  if (!req.session.user) {
    req.session.user = {}
  }
  next()
})


function add_user(user_data){
  redisDB.set("user:"+user_data.email, user_data.name)
  redisDB.set("pass:"+user_data.email, user_data.password)
}

function check_registration_data(user_data){
  if (user_data.confirmation_password != user_data.password){
    return false
  }
}

async function check_existing_user(user_data){
  try{
    if (await redisDB.get("user:"+user_data.email)) {return false}
    return true
  }
  catch{
    return false
  }
}

async function check_returning_user(user_data){
  try {
    password = await redisDB.get("pass:"+user_data.email)
    return password == user_data.password
  }
  catch {
    return false
  }
}

// Devuelve por defecto la página de login
aplicacion.get('/', function(req, res, next){
  console.log(req.session)
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
], async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {  
      if ('email' in errors.mapped()) {res.send(fs.readFileSync("html/index-regis-email.html").toString())}
      else if ('password' in errors.mapped()) {res.send(fs.readFileSync("html/index-regis-pass-short.html").toString())}
    }
    
    else if (req.body.confirmation_password){
      if (check_registration_data(req.body)){
        if (await check_existing_user(req.body)){res.send(fs.readFileSync("html/index-regis-user.html").toString())}
        else{
          add_user(req.body)
          res.send("LOGED")
        }
      }
      else {res.send(fs.readFileSync("html/index-regis-pass.html").toString())}
    }
    else{
      if (await check_returning_user(req.body)){
        res.send("LOGED")
      }
      else {
        res.send(fs.readFileSync("html/index-login-email.html").toString())
      }
    }

    res.send()
})

aplicacion.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.send(fs.readFileSync("html/index").toString())
})

// Pone a escuchar al servidor y avisa por consola cuando esta listo
port = 8080
hostname = "localhost"
server.listen(port, hostname, () => {
    console.log(`Stream server running at http://${hostname}:${port}/`);
});


//Cuando el server escuche una conexiòn serà un socket cliente:
io.on('connection',function(socket){
		//Luego cuando haya una peticiòn de stream en ese socket... nos mandarà una imagen:
		//Vamos a trabajar el stream como imagen. Vamos a enviar una cantidad definida de imàgenes por segundo.
		socket.on('stream',function(image){
      socket.broadcast.emit('stream',image)//Y luego va a transmitirlo a los demàs sockets conectados y emitirà una imagen (image)
    })
})
