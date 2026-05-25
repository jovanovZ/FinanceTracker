import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import IndexRouter from './routes/index.routes.js';
import CategoryRouter from './routes/category.routes.js';
import TransactionRouter from './routes/transaction.routes.js';
import AuthRouter from './routes/auth.routes.js';
import ImportRouter from './routes/import.routes.js';
// import GoalsRouter from "./routes/goals.routes.js"; // TODO: fix getGoalById missing in goalsController
import { connectDB } from './config/db.js';
import BudgetRouter from "./routes/budgetRoutes.js";
import StatementsRouter from "./routes/statements.routes.js";   

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

// Security
app.use(helmet())

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging
app.use(logger('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rute
app.use('/', IndexRouter);
app.use('/auth', AuthRouter);
app.use('/category', CategoryRouter);
app.use('/transaction', TransactionRouter);
app.use('/import', ImportRouter);
// app.use("/goals", GoalsRouter);
app.use("/budgets", BudgetRouter);
app.use("/statements", StatementsRouter);
// 404 handler
app.use(function(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

console.log('Server started on port', process.env.PORT || 3000);

export default app;