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

aplicacion.use(async function(req, res, next) {
  if (!req.session.user) {
    req.session.user = null
    req.session.privilege = null
  }

  if (req.body.email){
    req.session.user = await get_user_name(req.body.email)
  }

  if (req.session.privilege == null && await check_privilige(req.body)){
    req.session.privilege = true
  }
  else {req.session.privilege = false }
  next()
})

async function get_user_name(email){
  try {
    return redisDB.get("user:"+email)
  }
  catch{
    return "ANON"
  }
}

function add_user(user_data){
  redisDB.set("user:"+user_data.email, user_data.name)
  redisDB.set("pass:"+user_data.email, user_data.password)
  if(user_data.streaming_privileges){
    redisDB.sadd("privileges", user_data.email)
  }
}

async function check_privilige(user_data){
  try {
    res = await redisDB.sismember("privileges", user_data.email)
    if (res == 0){return false}
    else {return true}
  }
  catch {
    return false
  }
}

function check_registration_data(user_data){
  return user_data.confirmation_password == user_data.password
}

async function check_existing_user(user_data){
  try{
    if (await redisDB.get("user:"+user_data.email) == null) {return false}
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

aplicacion.post(['/', '/index*'], [
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
      if ('email' in errors.mapped()) {res.redirect("index-regis-email.html")}
      else if ('password' in errors.mapped()) {res.redirect("index-regis-pass-short.html")}
    }
    
    else if (req.body.confirmation_password){
      if (check_registration_data(req.body)){
        if (await check_existing_user(req.body)){res.redirect("index-regis-user.html")}
        else{
          add_user(req.body)
          if (req.session.privilege){
            res.redirect("emitir.html")}
          }
          res.redirect("conference.html")
      }
      else {res.redirect("index-regis-pass.html")}
    }
    else{
      if (await check_returning_user(req.body)){
        if (req.session.privilege){
          res.redirect("emitir.html")
        }
        res.redirect("conference.html")
      }
      else {
        res.redirect("index-login-email.html")
      }
    }
    res.send()
})

aplicacion.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.send()
})

aplicacion.get('/userName', (req, res, next) => {
  res.send("<name>" + req.session.user + "</name>")
})

// Pone a escuchar al servidor y avisa por consola cuando esta listo
port = 8080
hostname = "localhost"
server.listen(port, hostname, () => {
    console.log(`Stream server running at http://${hostname}:${port}/`);
}); 

//Cuando el server escuche una conexion sero un socket cliente:
io.on('connection',function(socket){

    //Para el streaming de video:
		socket.on('stream',function(image){ //Cuando haya una peticiòn de stream en ese socket... nos mandarà una imagen.
      //Vamos a trabajar el stream como imagen. Vamos a enviar una cantidad definida de imàgenes por segundo.
      socket.broadcast.emit('stream',image)//Y luego va a transmitirlo a los demàs sockets conectados y emitirà una imagen (image)
    })

    //Para el chat:
    socket.send(JSON.stringify(
      {type:'serverMessage',
      message: 'Welcome to the Conference Room'}));

    socket.on('message', function(message){
      message= JSON.parse(message);     
      if(message.type == "userMessage"){
        socket.broadcast.send(JSON.stringify(message));  //enviamos a todos los sockets menos el que envìo el msje.
        message.type = "myMessage";
        socket.send(JSON.stringify(message));  //enviamos al socket que enviò el mensaje.
      }

    });
})

    
