/**
 * After-School Lessons API Server
 * CST3144 Coursework - Backend
 * 
 * Student: Mohammad Amaan Khan (M00986493)
 * 
 * This Express.js server provides REST API endpoints for:
 * - Fetching lessons from MongoDB
 * - Searching lessons
 * - Creating orders
 * - Updating lesson availability
 * - Serving static images
 */

// ============================================
// DEPENDENCIES
// ============================================

// Express.js - Web framework for Node.js
const express = require('express');

// CORS - Enables Cross-Origin Resource Sharing (allows frontend to call API)
const cors = require('cors');

// MongoDB driver - For database operations
// MongoClient: connects to database
// ObjectId: converts string IDs to MongoDB ObjectId format
const { MongoClient, ObjectId } = require('mongodb');

// Custom middleware (local files)
const logger = require('./middleware/logger');       // Logs all incoming requests
const staticFiles = require('./middleware/static'); // Serves images from /images folder

// ============================================
// APP CONFIGURATION
// ============================================

// Create Express application instance
const app = express();

// Server port - Uses environment variable on Render, defaults to 3000 locally
const PORT = process.env.PORT || 3000;

// MongoDB connection string
// On Render: Set via environment variable (MONGODB_URI)
// Locally: Defaults to local MongoDB instance
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Database name for this application
const DB_NAME = 'afterschool';

// Database connection reference (populated after successful connection)
let db;

// ============================================
// DATABASE CONNECTION
// ============================================

/**
 * Connects to MongoDB Atlas database
 * Called once when server starts
 * Exits process if connection fails (server can't work without database)
 */
async function connectToDatabase() {
  try {
    // Connect to MongoDB using connection string
    const client = await MongoClient.connect(MONGODB_URI);
    
    // Get reference to our specific database
    db = client.db(DB_NAME);
    
    // Log success message
    console.log('Connected to MongoDB successfully');
    console.log(`Database: ${DB_NAME}`);
  } catch (error) {
    // Log error details for debugging
    console.error('MongoDB connection error:', error);
    console.error('Connection string starts with:', MONGODB_URI.substring(0, 20));
    
    // Exit with error code - server cannot function without database
    process.exit(1);
  }
}

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS for all origins
// This allows the frontend (GitHub Pages) to make requests to this API
app.use(cors());

// Parse JSON request bodies
// Converts incoming JSON data to JavaScript objects (req.body)
app.use(express.json());

// Custom logger middleware
// Logs method, URL, and timestamp for every request
app.use(logger);

// Static file server middleware
// Serves images from the /images directory when URL starts with /images/
app.use(staticFiles);

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /lessons
 * Returns all lessons from the database
 * 
 * Response: Array of lesson objects
 * Each lesson has: _id, subject, location, price, spaces, icon
 */
app.get('/lessons', async (req, res) => {
  try {
    // Find all documents in the 'lessons' collection
    // find({}) with empty query returns all documents
    // toArray() converts cursor to array
    const lessons = await db.collection('lessons').find({}).toArray();
    
    // Send lessons as JSON response
    res.json(lessons);
  } catch (error) {
    // Send 500 error if database query fails
    res.status(500).json({ 
      error: 'Failed to fetch lessons', 
      message: error.message 
    });
  }
});

/**
 * GET /search?q={query}
 * Searches lessons by subject, location, price, or spaces
 * 
 * Query Parameter: q - The search term
 * Response: Array of matching lesson objects
 * 
 * Search is case-insensitive and matches partial strings
 */
app.get('/search', async (req, res) => {
  try {
    // Get search query from URL parameter (e.g., /search?q=math)
    const query = req.query.q || '';
    
    // If no search query provided, return all lessons
    if (!query) {
      const lessons = await db.collection('lessons').find({}).toArray();
      return res.json(lessons);
    }

    // Search across multiple fields using MongoDB $or operator
    // $regex enables pattern matching, $options: 'i' makes it case-insensitive
    const searchResults = await db.collection('lessons').find({
      $or: [
        { subject: { $regex: query, $options: 'i' } },   // Search in subject
        { location: { $regex: query, $options: 'i' } },  // Search in location
        { price: { $regex: query, $options: 'i' } },     // Search in price (as string)
        { spaces: parseInt(query) || -1 }                // Search spaces (exact number match)
      ]
    }).toArray();

    // Return matching lessons
    res.json(searchResults);
  } catch (error) {
    // Send 500 error if search fails
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
});

/**
 * POST /orders
 * Creates a new order in the database
 * 
 * Request Body (JSON):
 *   - name: Customer's name (string)
 *   - phone: Customer's phone number (string)
 *   - lessonIds: Array of lesson IDs being ordered
 *   - spaces: Number of spaces being booked
 * 
 * Response: Success message with order ID and order details
 */
app.post('/orders', async (req, res) => {
  try {
    // Extract order data from request body
    const { name, phone, lessonIds, spaces } = req.body;

    // Validate that all required fields are present
    if (!name || !phone || !lessonIds || !spaces) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide name, phone, lessonIds, and spaces' 
      });
    }

    // Create order object with timestamp
    const order = {
      name,                    // Customer name
      phone,                   // Customer phone
      lessonIds,               // Array of lesson IDs
      spaces,                  // Number of spaces booked
      createdAt: new Date()    // Timestamp for when order was created
    };

    // Insert order into 'orders' collection
    const result = await db.collection('orders').insertOne(order);
    
    // Return success response with 201 (Created) status
    res.status(201).json({ 
      message: 'Order created successfully',
      orderId: result.insertedId,  // MongoDB-generated unique ID
      order                         // The full order object
    });
  } catch (error) {
    // Send 500 error if order creation fails
    res.status(500).json({ 
      error: 'Failed to create order', 
      message: error.message 
    });
  }
});

/**
 * PUT /lessons/:id
 * Updates the available spaces for a specific lesson
 * 
 * URL Parameter: id - The lesson's MongoDB ObjectId
 * Request Body (JSON):
 *   - spaces: New number of available spaces (integer >= 0)
 * 
 * Response: Success message with modification count
 */
app.put('/lessons/:id', async (req, res) => {
  try {
    // Get lesson ID from URL parameter
    const { id } = req.params;
    
    // Get new spaces value from request body
    const { spaces } = req.body;

    // Validate spaces value
    if (spaces === undefined || spaces < 0) {
      return res.status(400).json({ 
        error: 'Invalid spaces value',
        message: 'Spaces must be a non-negative number' 
      });
    }

    // Update the lesson document in database
    // $set operator updates only the specified field
    const result = await db.collection('lessons').updateOne(
      { _id: new ObjectId(id) },           // Find lesson by ID
      { $set: { spaces: parseInt(spaces) } } // Set new spaces value
    );

    // Check if lesson was found
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Return success response
    res.json({ 
      message: 'Lesson updated successfully',
      modifiedCount: result.modifiedCount  // Number of documents modified
    });
  } catch (error) {
    // Send 500 error if update fails
    res.status(500).json({ 
      error: 'Failed to update lesson', 
      message: error.message 
    });
  }
});

/**
 * GET /
 * Root endpoint - Returns API documentation
 * Useful for testing if the API is running and seeing available endpoints
 */
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

// ============================================
// SERVER STARTUP
// ============================================

// Connect to database first, then start the server
connectToDatabase().then(() => {
  // Start listening for HTTP requests
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Handle Ctrl+C (SIGINT) signal for clean shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});
