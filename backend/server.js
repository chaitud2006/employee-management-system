const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Request logging in console

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running successfully on http://localhost:${PORT}`);
});