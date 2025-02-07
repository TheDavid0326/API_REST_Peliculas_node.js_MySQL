import express, { json } from 'express';
import { moviesRouter } from './routes/movies.js';
import { corsMiddleware } from './middlewares/cors.js';

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT ?? 1234;

// Middleware para manejar routers, JSON, el CORS
app.use(json());// Debe estar antes de las rutas
app.use('/movies', moviesRouter);
app.use(corsMiddleware());

app.listen(PORT, () => {
  console.log(`Server listening on port: http://localhost:${PORT}`);
});
