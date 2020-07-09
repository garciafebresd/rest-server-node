// Port
process.env.PORT = process.env.PORT || 3000;


// Vencimiento del token
process.env.TOKEN_EXPIRED_IN = '48h';

// Seet de autenticación
process.env.SEED = process.env.SEED || 'seed-del-token';

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de datos
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// Google client
process.env.CLIENT_ID = process.env.CLIENT_ID || '185749488348-5gcjdgf9qvpjiqee4gge8qac0d491pjh.apps.googleusercontent.com';