import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from "cors";
import { appendFileSync } from 'fs';

import IndexRouter from './routes/index.routes.js';
import CategoryRouter from './routes/category.routes.js'
import TransactionRouter from './routes/transaction.routes.js';
import AuthRouter from './routes/auth.routes.js';

var app = express();

app.use(cors({
  origin: '*',
  credentials: true,               
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// rabis jwt token kjerkoli razen za login
//app.use(
//  expressjwt({
//    secret: process.env.JWT_SECRET,
//    algorithms: [process.env.JWT_ALGORITHM],
//  }).unless({ path: ["/users/login", "/users/register", "/hiveWeight", "/notes", "/public"] })
//)

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});


app.use('/',IndexRouter)
app.use('/category',CategoryRouter)
app.use('/transaction',TransactionRouter)
app.use('/auth',AuthRouter)

// error handler
//app.use(function(err, req, res, next) {
  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});

console.log("Server started on port ",process.env.PORT || 3000);
export default app;