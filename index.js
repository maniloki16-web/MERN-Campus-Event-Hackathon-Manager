const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const routes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const teamRoutes = require('./routes/teamRoutes');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.log('Database connection error:', err));

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(bodyParser.json());

// API Routes
app.use('/api/events', routes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/teams', teamRoutes);

// Serve React frontend
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// React routes
app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'client', 'dist', 'index.html')
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});