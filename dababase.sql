CREATE DATABASE moviesdb;

USE moviesdb;

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

INSERT INTO genres (name) VALUES 
('Drama'), 
('Action'), 
('Crime'), 
('Sci-Fi'), 
('Adventure'), 
('Romance'), 
('Animation'), 
('Biography'), 
('Fantasy');

INSERT INTO movies (title, year, director, duration, poster, rate) VALUES 
("The Shawshank Redemption", 1994, "Frank Darabont", 142, "https://i.ebayimg.com/images/g/4goAAOSwMyBe7hnQ/s-l1200.webp", 9.3),
("The Dark Knight", 2008, "Christopher Nolan", 152, "https://i.ebayimg.com/images/g/yokAAOSw8w1YARbm/s-l1200.jpg", 9.0),
("Inception", 2010, "Christopher Nolan", 148, "https://m.media-amazon.com/images/I/91Rc8cAmnAL._AC_UF1000,1000_QL80_.jpg", 8.8),
("Pulp Fiction", 1994,"Quentin Tarantino", 154, "https://www.themoviedb.org/t/p/original/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg", 8.9);

INSERT INTO movies_genre (id_movie, id_genre) VALUES 
((SELECT id FROM movies WHERE title="The Shawshank Redemption"), (SELECT id FROM genres WHERE name = 'Drama')),
((SELECT id FROM movies WHERE title="The Dark Knight"), (SELECT id FROM genres WHERE name = 'Action')),
((SELECT id FROM movies WHERE title="The Dark Knight"), (SELECT id FROM genres WHERE name = 'Crime')),
((SELECT id FROM movies WHERE title="The Dark Knight"), (SELECT id FROM genres WHERE name = 'Drama')),
((SELECT id FROM movies WHERE title="Inception"), (SELECT id FROM genres WHERE name = 'Action')),
((SELECT id FROM movies WHERE title="Inception"), (SELECT id FROM genres WHERE name = 'Adventure')),
((SELECT id FROM movies WHERE title="Inception"), (SELECT id FROM genres WHERE name = 'Sci-Fi')),
((SELECT id FROM movies WHERE title="Pulp Fiction"), (SELECT id FROM genres WHERE name = 'Drama')),
((SELECT id FROM movies WHERE title="Pulp Fiction"), (SELECT id FROM genres WHERE name = 'Crime'));

SELECT * FROM movies;

// Para ver id como string
SELECT *, BIN_TO_UUID(id) FROM movies;

// Consultas SQL para obtener todas las películas de un género, pero no devuelve los géneros que tiene
USE moviesdb;
SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movies_genre
INNER JOIN movies ON id=id_movie
WHERE id_genre = (SELECT id FROM genres WHERE name = 'ACTION')

// Consula para obtener los género de una película a partir de su id
SELECT genres.name FROM genres
INNER JOIN movies_genre ON genres.id=movies_genre.id_genre
WHERE BIN_TO_UUID(movies_genre.id_movie)='1c910c8a-e25c-11ef-8a3b-f0795930848c';

// Consulta para obtener todas las películas incluyendo sus géneros
SELECT 
	BIN_TO_UUID(movies.id) id, 
	title, 
	year, 
	director, 
	duration, 
	poster, 
	rate, 
	GROUP_CONCAT(genres.name ORDER BY genres.name SEPARATOR ', ') AS genres 
FROM movies
INNER JOIN movies_genre ON movies.id=movies_genre.id_movie
INNER JOIN genres ON genres.id=movies_genre.id_genre
GROUP BY movies.id, title, year, director, duration, poster, rate;

// Consulta para obtener todas las películas de un género, problema: No muestra los otros géneros asociados de las películas
SELECT 
  BIN_TO_UUID(movies.id) id, 
  title, 
  year, 
  director, 
  duration, 
  poster, 
  rate, 
GROUP_CONCAT(genres.name ORDER BY genres.name SEPARATOR ', ') AS genres 
FROM movies
INNER JOIN movies_genre ON movies.id=movies_genre.id_movie
INNER JOIN genres ON genres.id=movies_genre.id_genre
WHERE id_genre = (SELECT id FROM genres WHERE name = 'ACTION')
GROUP BY movies.id, title, year, director, duration, poster, rate

// Dos consultas combinadas para obtener todas las películas de un género específico, 
con la primera de obtiene el id 
y con la segunda toda la información incluyendo todos los géneros asociados a cada película.
SELECT
        BIN_TO_UUID(movies.id) AS id FROM movies
        INNER JOIN movies_genre ON movies.id=movies_genre.id_movie
        INNER JOIN genres ON genres.id=movies_genre.id_genre
        WHERE id_genre = (SELECT id FROM genres WHERE name = 'ACTION');

SELECT
	BIN_TO_UUID(movies.id) id,
	title,
	year,
	director,
	duration,
	poster,
	rate,
	GROUP_CONCAT(genres.name ORDER BY genres.name SEPARATOR ', ') AS genres
FROM movies
INNER JOIN movies_genre ON movies.id=movies_genre.id_movie
INNER JOIN genres ON genres.id=movies_genre.id_genre
WHERE BIN_TO_UUID(movies.id) = '1c910c8a-e25c-11ef-8a3b-f0795930848c'
GROUP BY movies.id, title, year, director, duration, poster, rate;

// Consulta para sacar todas las películas de un mismo género
SELECT 
  BIN_TO_UUID(movies.id) AS id,
  movies.title,
  movies.year,
  movies.director,
  movies.duration,
  movies.poster,
  movies.rate,
  GROUP_CONCAT(genres.name ORDER BY genres.name SEPARATOR ', ') AS genres
FROM 
  movies
INNER JOIN 
  movies_genre ON movies.id = movies_genre.id_movie
INNER JOIN 
  genres ON genres.id = movies_genre.id_genre
WHERE 
  movies.id IN (
    SELECT 
      movies.id 
    FROM 
      movies 
    INNER JOIN 
      movies_genre ON movies.id = movies_genre.id_movie 
    INNER JOIN 
      genres ON genres.id = movies_genre.id_genre 
    WHERE 
      genres.name = ?
  )
GROUP BY 
  movies.id, movies.title, movies.year, movies.director, movies.duration, movies.poster, movies.rate