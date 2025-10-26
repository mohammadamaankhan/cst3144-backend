// Main Express.js Server for After-School Lessons App
// Clean and simple architecture for easy demonstration

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const logger = require('./middleware/logger');
const staticFiles = require('./middleware/static');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string - will be set via environment variable on Render
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'afterschool';

let db;

// Connect to MongoDB Atlas (mongodb+srv handles SSL automatically)
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB successfully');
    console.log(`Database: ${DB_NAME}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Connection string starts with:', MONGODB_URI.substring(0, 20));
    process.exit(1);
  }
}

// Middleware
app.use(cors()); // Enable CORS for all origins (will configure for GitHub Pages)
app.use(express.json()); // Parse JSON request bodies
app.use(logger); // Log all requests
app.use(staticFiles); // Serve static images

// ===== REST API ENDPOINTS =====

// GET /lessons - Return all lessons (3% marks)
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons', message: error.message });
  }
});

// GET /search?q={query} - Search lessons (4% marks - part of 10% search feature)
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query) {
      // If no query, return all lessons
      const lessons = await db.collection('lessons').find({}).toArray();
      return res.json(lessons);
    }

    // Search across subject, location, and convert price/spaces to string for matching
    const searchResults = await db.collection('lessons').find({
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { price: { $regex: query, $options: 'i' } },
        { spaces: parseInt(query) || -1 } // Match spaces if query is a number
      ]
    }).toArray();

    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// POST /orders - Create new order (4% marks)
app.post('/orders', async (req, res) => {
  try {
    const { name, phone, lessonIds, spaces } = req.body;

    // Basic validation
    if (!name || !phone || !lessonIds || !spaces) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide name, phone, lessonIds, and spaces' 
      });
    }

    const order = {
      name,
      phone,
      lessonIds,
      spaces,
      createdAt: new Date()
    };

    const result = await db.collection('orders').insertOne(order);
    
    res.status(201).json({ 
      message: 'Order created successfully',
      orderId: result.insertedId,
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
});

// PUT /lessons/:id - Update lesson spaces (5% marks)
app.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { spaces } = req.body;

    // Validate spaces
    if (spaces === undefined || spaces < 0) {
      return res.status(400).json({ 
        error: 'Invalid spaces value',
        message: 'Spaces must be a non-negative number' 
      });
    }

    // Update the lesson spaces to the specific value
    const result = await db.collection('lessons').updateOne(
      { _id: new ObjectId(id) },
      { $set: { spaces: parseInt(spaces) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ 
      message: 'Lesson updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson', message: error.message });
  }
});

// Root endpoint - API documentation (useful for demo and testing)
app.get('/', (req, res) => {
  res.json({
    message: 'After-School Lessons API - CST3144 Coursework',
    version: '1.0.0',
    author: 'Mohammad Amaan Khan',
    endpoints: {
      'GET /lessons': 'Retrieve all lessons from database',
      'GET /search?q={query}': 'Search lessons by subject, location, price, or spaces',
      'POST /orders': 'Create new order (requires: name, phone, lessonIds, spaces)',
      'PUT /lessons/:id': 'Update lesson spaces to specific value',
      'GET /images/*': 'Serve lesson images from static directory'
    },
    database: {
      name: DB_NAME,
      collections: ['lessons', 'orders']
    }
  });
});

// Start server and connect to database
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

