import express, { NextFunction, Request, Response, Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';

import indexRouter from './routes/index';
import customersRouter from './routes/customers';
import logsRouter from './routes/logs';
import ordersRouter from './routes/orders';
import quotationsRouter from './routes/quotations';
import usersRouter from './routes/users';

const cookieParser = require('cookie-parser');

//dotenv setup
require('dotenv').config();

const app: Express = express();

app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

//Connexion à la BDD
const connectionString: string = process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING : "";
mongoose.connect(connectionString)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));


//Protection helmet contre les attaques XSS
app.use(helmet.xssFilter());
//Protection contre le click jacking
app.use(helmet.frameguard({ action: "deny" }));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/customers', customersRouter);
app.use('/quotations', quotationsRouter);
app.use('/logs', logsRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
})

//Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

export default app;
