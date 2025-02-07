import { Router } from 'express';
import { movieController } from '../controllers/movies.js';

export const moviesRouter = Router();

moviesRouter.get('/', movieController.getAll);
moviesRouter.post('/', movieController.create);

moviesRouter.get('/:id', movieController.getById);
moviesRouter.patch('/:id', movieController.update);
moviesRouter.delete('/:id', movieController.delete);
