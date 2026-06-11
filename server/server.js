const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  // If no URI or default template URI is provided, use in-memory DB for immediate dev testing
  if (!mongoUri || mongoUri.includes('<username>')) {
    console.log('No valid MongoDB Atlas URI found. Starting In-Memory MongoDB for development...');
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully to:', mongoUri.includes('mongodb.net') ? 'Atlas' : 'In-Memory Server');
    
    // Routes
    app.use('/api', apiRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
}

startServer();
