const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const endpointApi = require('./routes/index');
const { errorHandler, notFoundPath } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
require('dotenv').config();

// port
const port = process.env.PORT || 3000;
const baseUrlFE = process.env.FRONT_END_URL;
const allowedOrigins = [
  'http://localhost:3000',
  'http://api.localhost:3000',
  'http://localhost:5173',
  baseUrlFE
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimiter);

app.get('/', (req, res) => res.redirect('/api-docs'));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, {
    swaggerOptions: {
      requestInterceptor: (req) => {
        req.credentials = 'include';
        return req;
      },
    },
  })
);

app.use('/api/v1', endpointApi);
app.use('/uploads', express.static('uploads'));

app.use(notFoundPath);
app.use(errorHandler);

setInterval(() => {
  const usage = process.memoryUsage();
  const now = new Date().toISOString();
  console.log(`\n[MEMORY CHECK - ${now}]`);
  console.log(`- RSS        : ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Heap Total : ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Heap Used  : ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- External   : ${(usage.external / 1024 / 1024).toFixed(2)} MB`);
  console.log('-------------------------------------------');
}, 15 * 60 * 1000);

// connect to MongoDB then start server
async function start() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('berhasil terhubung ke database..');
    app.listen(port, () => {
      console.log(`server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    });
  } catch (error) {
    console.error(`gagal terhubung ke database: ${error.message}`);
    process.exit(1);
  }
}

start();
