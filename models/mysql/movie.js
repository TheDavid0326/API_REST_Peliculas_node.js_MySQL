import mysql from 'mysql2/promise';

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'moviesdb'
};

const connection = await mysql.createConnection(config);

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const [movies] = await connection.query(`
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
          movies.id, movies.title, movies.year, movies.director, movies.duration, movies.poster, movies.rate;`,
      [genre]);
      return movies;
    }

    const [movies] = await connection.query( // connection.query devuelve un array y estamos extrayendo el primer elemento de ese array y asignándolo a la variable movies
      `SELECT 
        BIN_TO_UUID(movies.id) id, 
        title, 
        year, 
        director, 
        duration, 
        poster, 
        rate, 
      GROUP_CONCAT(genres.name ORDER BY genres.name SEPARATOR ', ') AS genre 
      FROM movies
      INNER JOIN movies_genre ON movies.id=movies_genre.id_movie
      INNER JOIN genres ON genres.id=movies_genre.id_genre
      GROUP BY movies.id, title, year, director, duration, poster, rate;`);
    return movies;
  }

  static async getById ({ id }) {
    let [movie] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movies WHERE BIN_TO_UUID(id)=?;', [id]);
    const [genres] = await connection.query(
      `SELECT genres.name AS genre FROM genres
      INNER JOIN movies_genre ON genres.id=movies_genre.id_genre
      WHERE BIN_TO_UUID(movies_genre.id_movie)=?`, [id]);

    // Transformar el resultado en un array simple
    const genreList = genres.map(g => g.genre);
    movie = movie[0];

    console.log('Genres', genres);
    return {
      ...movie,
      genre: genreList
    };
  }

  static async create ({ input }) {
    const {
      genre: genreInput // genreInput es un array de un número indeterminado: ["Action","Sci-fi",..]
    } = input;

    const [uuidResult] = await connection.query('SELECT UUID() AS uuid;');
    const { uuid } = uuidResult[0];
    let genreId;

    try {
      await connection.query(
        `INSERT INTO movies (id, title, year, director, duration, poster, rate) 
        VALUES (UUID_TO_BIN(?),?,?,?,?,?,?);`, [uuid, input.title, input.year, input.director, input.duration, input.poster, input.rate]);
    } catch (error) {
      // Cuidado, se podría enviar información sensible
      throw new Error('Error creating movie');
      // Enviar la información del error a un servicio interno
      // send.log(error)
    }

    for (const genre of genreInput) {
      [genreId] = await connection.query('SELECT id FROM genres WHERE name=?', [genre]);
      if (genreId.length === 0) {
        await connection.query('INSERT INTO genres (name) VALUES (?);', [genre]);
        [genreId] = await connection.query('SELECT id FROM genres WHERE name=?;', [genre]);
      }
      genreId = genreId[0].id;

      await connection.query('INSERT INTO movies_genre (id_movie, id_genre) VALUES (UUID_TO_BIN(?),?);', [uuid, genreId]);
    }
    return { uuid, ...input };
  }

  static async delete ({ id }) {
    const [movieToDelete] = await connection.query('SELECT id FROM movies WHERE BIN_TO_UUID(id)=?;', [id]);
    if (movieToDelete.length === 0) {
      return false;
    }

    try {
      await connection.query('DELETE FROM movies_genre WHERE BIN_TO_UUID(id_movie)=?;', [id]);
      await connection.query('DELETE FROM movies WHERE BIN_TO_UUID(id)=?;', [id]);
      return true;
    } catch (error) {
      // Cuidado, se podría enviar información sensible
      // console.error('Error deleting movie', error.message, error.stack);
      throw new Error('Error deleting movie');
      // Enviar la información del error a un servicio interno
      // send.log(error)
    }
  }

  static async update ({ id, input }) {
    const [movieToUpdate] = await connection.query(`SELECT
            BIN_TO_UUID(movies.id) id,
            title,
            year,
            director,
            duration,
            poster,
            rate,
          GROUP_CONCAT(genres.name ORDER BY genres.name SEPARATOR ', ') AS genre
          FROM movies
          INNER JOIN movies_genre ON movies.id=movies_genre.id_movie
          INNER JOIN genres ON genres.id=movies_genre.id_genre
          WHERE BIN_TO_UUID(movies.id) = ?
          GROUP BY movies.id, title, year, director, duration, poster, rate;`, [id]);
    if (movieToUpdate.length === 0) {
      return false;
    }
    const [currentMovie] = movieToUpdate;
    // console.log('currentMovie', currentMovie);
    const {
      title = currentMovie.title,
      year = currentMovie.year,
      director = currentMovie.director,
      duration = currentMovie.duration,
      rate = currentMovie.rate,
      poster = currentMovie.poster,
      genre: newGenres
    } = input;
    await connection.query(`UPDATE movies SET title=?, year=?, director=?, duration=?, rate=?, poster=? 
      WHERE BIN_TO_UUID(id)=?;`, [title, year, director, duration, rate, poster, id]);

    const updatedMovie = {
      ...currentMovie,
      ...input
    };

    if (newGenres === undefined) {
      console.log('Entramos en el if de undefined');
      return updatedMovie;
    }

    // Código para actualizar los géneros
    // Quiero comparar un array nuevo [Action, Adventure] con otro array a sobreescribir [Action, Comedy, Sci-fi]
    const [genres] = await connection.query(
      `SELECT genres.name AS genre FROM genres
      INNER JOIN movies_genre ON genres.id=movies_genre.id_genre
      WHERE BIN_TO_UUID(movies_genre.id_movie)=?`, [id]);

    // Transformar el resultado en un array simple
    const oldGenreList = genres.map(g => g.genre);
    console.log('newGenre', newGenres);
    console.log('oldGenreList', oldGenreList);

    // Lógica para añadir un nuevo género que no estuviera ya en la BD
    let found;
    for (const newGenre of newGenres) {
      found = false;
      for (const oldGenre of oldGenreList) {
        if (newGenre.toLowerCase() === oldGenre.toLowerCase()) {
          found = true;
          break;
        }
      }
      if (!found) {
        console.log('newGenre dentro del if', newGenre);
        let [newGenreId] = await connection.query('SELECT id FROM genres LOWER(name) = LOWER(?)', [newGenre]);
        console.log('newGenreId', newGenreId);
        newGenreId = newGenreId[0].id;
        console.log('newGenreId2', newGenreId);
        await connection.query('INSERT INTO movies_genre (id_movie, id_genre) VALUES (UUID_TO_BIN(?), ?)', [id, newGenreId]);
      }
    }

    // Lógica para borrar los viejos géneros que no estén en el nuevo input
    for (const oldGenre of oldGenreList) {
      found = false;
      for (const newGenre of newGenres) {
        if (newGenre.toLowerCase() === oldGenre.toLowerCase()) {
          found = true;
          break;
        }
      }
      if (!found) {
        let [oldGenreId] = await connection.query('SELECT id FROM genres WHERE name=?', [oldGenre]);
        oldGenreId = oldGenreId[0].id;
        await connection.query('DELETE FROM movies_genre  WHERE id_movie=UUID_TO_BIN(?) AND id_genre=?', [id, oldGenreId]);
      }
    }

    return updatedMovie;
  }
}
