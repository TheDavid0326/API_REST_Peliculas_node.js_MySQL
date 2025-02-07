# Movie Application

Esta es una aplicación de ejemplo que permite gestionar una base de datos de películas utilizando Node.js y MySQL.

## Configuración de la Base de Datos

1. **Asegúrate de tener MySQL instalado y funcionando en tu máquina.**

2. **Crea una base de datos llamada `moviesdb` en tu servidor MySQL.**

3. **Configura tus credenciales de MySQL en el archivo de configuración:**

```javascript

   const config = {
     host: 'localhost',
     port: 3306,
     user: 'root',
     password: '',
     database: 'moviesdb'
   };
```

4. **Inicializa la base de datos con las tablas necesarias. Puedes utilizar el siguiente script SQL como ejemplo:**
```
CREATE TABLE movies (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  title VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  director VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  poster TEXT,
  rate DECIMAL(2, 1) UNSIGNED NOT NULL
);

CREATE TABLE genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE movies_genre (
  PRIMARY KEY (id_movie, id_genre),
  id_movie BINARY(16),
  id_genre INT,
  FOREIGN KEY (id_movie) REFERENCES movies(id),
  FOREIGN KEY (id_genre) REFERENCES genres(id)
);
```

## Uso

### Controladores

Los controladores de la aplicación están definidos en `controllers/movieController.js` y proporcionan las siguientes funcionalidades:

- **getAll**: Obtiene todas las películas, con opción de filtrarlas por género.
- **getById**: Obtiene una película por su ID.
- **create**: Crea una nueva película.
- **update**: Actualiza una película existente.
- **delete**: Elimina una película por su ID.

### Modelos

Los modelos de la aplicación están definidos en `models/mysql/movie.js` y proporcionan las siguientes funcionalidades:

- **getAll**: Obtiene todas las películas con sus géneros.
- **getById**: Obtiene una película por su ID con sus géneros.
- **create**: Crea una nueva película y sus géneros.
- **update**: Actualiza una película y sus géneros.
- **delete**: Elimina una película y sus géneros.

### Validación

Las funciones de validación están definidas en `schemas/movies.js` utilizando `zod` para validar los datos de las películas.

### Archivo api.http

El archivo `api.http` contiene ejemplos de solicitudes HTTP para probar la API de la aplicación. Aquí hay algunos ejemplos de cómo utilizarlo:

- **Recupera todas las películas**

```http
GET http://localhost:1234/movies
```
  
- **Recupera películas por id**

```http
GET http://localhost:1234/movies/2704e434-e3f7-11ef-b114-f0795930848c
GET http://localhost:1234/movies/1c910c8a-e25c-11ef-8a3b-f0795930848c
```
  
- **Recupera todas las películas por género**

```http
GET http://localhost:1234/movies?genre=animation
```
  
- **Crea una película**

```http
POST http://localhost:1234/movies
Content-Type: application/json

{
  "title": "Pacific Rim",
  "year": 2013,
  "director": "Guillermo del Toro",
  "duration": 131, 
  "poster": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN85QeuAWcYaiMOLKbwDJRKH37QBj5Dk9sgw&s",
  "genre": [
    "Comedy"
  ],
  "rate": 7.1
}
```
  
  
- **Crea una película con datos erróneos**

```http
POST http://localhost:1234/movies
Content-Type: application/json

{
  "title": 100,
  "year": "No tiene año",
  "director": 656,
  "duration": -56, 
  "poster": "imagen.jpg",
  "genre": [
    "Algo",
    "Rara"
  ],
  "rate": -5
}
```
  
- **Actualiza una película**

```http
PATCH http://localhost:1234/movies/2704e434-e3f7-11ef-b114-f0795930848c
Content-Type: application/json

{
  "year": 2013
}
```
  
- **Actualiza el género de una película**

```http
PATCH http://localhost:1234/movies/2704e434-e3f7-11ef-b114-f0795930848c
Content-Type: application/json

{
  "genre": [
    "Action",
    "Sci-fi"
  ]
}
```

- **Elimina una película**
```http
DELETE http://localhost:1234/movies/670ca5fc-e315-11ef-86a2-f0795930848c
```

## Licencia

Este proyecto está bajo la licencia MIT.

---

Espero que este README te sea útil. Si tienes alguna otra pregunta o necesitas más ayuda, ¡házmelo saber!
