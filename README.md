# TPFinal-APPenInternet
Trabajo Práctico final para la materia Aplicaciones en Internet, de la Univercidad Nacional de Avellaneda

## Instalación de dependencias

### Javascript
Todas las dependencias se encuentran en el archivo _requirements.txt_. Para instalarlas directamente con **npm**:
```
$ cat requirements.txt | xargs npm install -g
```

### Redis
La aplicación utiliza Redis para el guardado de los usuarios. Durante esta instalación usaremos un Redis Dockerizado.
Para instalar Docker, siga las instrucciones en la siguiente página: https://docs.docker.com/install/

Una vez listo, descargue la imagen de Redis:
```
$ docker image pull redis:5.0-alpine
```

## Uso

### Puesta en marcha de la base de datos
Debe ser un Redis local, que se encuentro escuchando por el puerto 6379 (el puerto por defecto de Redis). Si se está utilizando Docker, para hacer eso hay que crear un contenedor de Redis:
```
$ docker container run -d -p 6379:6379 --name redis-TPFinal redis:5.0-alpine
```
Esto pondrá a correr un contenedor que escucha en nuestro puerto 6379.

Para detener la base:
```
$ docker container stop redis-TPFinal
```
Para reiniciarla:
```
$ docker container start redis-TPFinal
```
El parado y reinicio **no** eliminará información de la base de datos.

### Puesta en marcha del servidor
El servidor solamente se debe inicializar una vez que se encuentra corriendo la base de datos.

Para iniciarlo, en la carpeta raíz del programa correr:
```
$ node server.js
```
En servidor comensará a escuchar en el puerto 8080.
