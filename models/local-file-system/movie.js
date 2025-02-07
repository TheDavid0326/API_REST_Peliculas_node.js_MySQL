import { readJSON } from '../../utils.js';
import { randomUUID } from 'node:crypto';
// import * as fs from 'fs';

const movies = readJSON('./movies.json');

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) { // some: Es un método de los arrays que comprueba si al menos un elemento en el array cumple la condición.
      return movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()));
    }
    return movies;
  }

  static async getById ({ id }) {
    return movies.find(movie => movie.id === id);
  }

  static async create ({ input }) {
    const newMovie = {
      id: randomUUID(),
      ...input
    };
    movies.push(newMovie);
    return newMovie;
    /*
    try {
      const jsonContent = JSON.stringify(movies, null, 2);
      fs.writeFile('./movies.json', jsonContent, 'utf8');
    } catch (error) {
      console.error('No se ha podido escribir el archivo movies.json, error:', error);
    }
    */
  }

  static async update ({ id, input }) {
    const movieIndex = movies.findIndex(movie => movie.id === id);
    if (movieIndex === -1) {
      return false;
    }
    // Las propiedades de input sobrescribirán las del objeto original.
    const updatedMovie = {
      ...movies[movieIndex],
      ...input
    };
    movies[movieIndex] = updatedMovie;
    return movies[movieIndex];
    /*
    const jsonContent = JSON.stringify(movies, null, 2);
    writeFile('./movies.json', jsonContent, 'utf8', (error) => {
      if (error) {
        console.error('No se ha podido escribir el archivo movies.json, error:', error);
        process.exit(1);
      } else {
        res.status(200).json(updatedMovie);
      }
    });
    */
  }

  static async delete ({ id }) {
    const deleteMovieIndex = movies.findIndex(movie => movie.id === id);

    if (deleteMovieIndex === -1) {
      return false;
    }
    movies.splice(deleteMovieIndex, 1);
    return true;
  }
}
