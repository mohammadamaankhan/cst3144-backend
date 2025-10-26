// Static file middleware - serves images from /images directory
// Marks: 4% of total coursework
// This middleware handles lesson images and returns appropriate errors if not found

const path = require('path');
const fs = require('fs');

function staticFiles(req, res, next) {
  // Only handle requests that start with /images
  if (req.url.startsWith('/images/')) {
    const filePath = path.join(__dirname, '..', req.url);
    
    // Check if file exists before serving
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist - return 404 error with helpful message
        console.log(`Image not found: ${req.url}`);
        res.status(404).json({ 
          error: 'Image not found',
          message: `The requested image ${req.url} does not exist`,
          path: req.url
        });
      } else {
        // File exists - serve it
        console.log(`Serving image: ${req.url}`);
        res.sendFile(filePath);
      }
    });
  } else {
    // Not an image request - pass to next middleware
    next();
  }
}

module.exports = staticFiles;

