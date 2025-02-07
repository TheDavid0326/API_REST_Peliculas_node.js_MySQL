// import { MovieModel } from '../models/local-file-system/movie.js';

import { MovieModel } from '../models/mysql/movie.js';
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';

export class movieController {
  static async getAll (req, res) {
    const { genre } = req.query;
    const movies = await MovieModel.getAll({ genre });
    res.json(movies);
  }

  static async getById (req, res) {
    const { id } = req.params;
    const movie = await MovieModel.getById({ id });
    if (movie) return res.status(200).json(movie);
    res.status(404).json({ message: 'Movie not found' });
  }

  static async create (req, res) {
    console.log('req.body:', req.body);
    const result = validateMovie(req.body);
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }
    const movieCreated = await MovieModel.create({ input: result.data });
    return res.status(201).json(movieCreated);
  }

  static async update (req, res) {
    const result = validatePartialMovie(req.body);
    if (!result.success) {
      return res.status(422).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const updatedMovie = await MovieModel.update({ id, input: result.data });
    if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
    return res.status(200).json(updatedMovie);
  }

  static async delete (req, res) {
    const { id } = req.params;
    if (await MovieModel.delete({ id })) return res.status(200).json({ message: 'Movie deleted' });
    res.status(404).json({ message: 'Movie not found' });
  }
}
