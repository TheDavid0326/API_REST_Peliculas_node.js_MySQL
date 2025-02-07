import cors from 'cors';

const ACCEPTED_ORIGINS = [ // Ejemplo
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://localhost:1234',
  'https://david-castro.es'
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!origin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
});

/*
Caso 1:
Se Proporciona un Objeto con acceptedOrigins:

corsMiddleware({ acceptedOrigins: ['http://example.com'] });
En este caso, acceptedOrigins se establece en ['http://example.com'].

Caso 2:
Se Proporciona un Objeto sin acceptedOrigins:

corsMiddleware({});
Aquí, el objeto {} no tiene acceptedOrigins, por lo que se utiliza el valor predeterminado ACCEPTED_ORIGINS.

Caso 3:
No Se Proporciona Ningún Argumento:

corsMiddleware();
En este caso, = {} asigna un objeto vacío si no se pasa ningún argumento a la función. Luego, acceptedOrigins toma el valor ACCEPTED_ORIGINS.
*/
