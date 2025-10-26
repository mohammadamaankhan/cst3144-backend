// Logger middleware - logs all incoming requests
// Marks: 4% of total coursework
// This middleware helps track all API requests for debugging and demo purposes

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${req.method} ${req.url}`;
  
  // Log to console for monitoring
  console.log(logMessage);
  
  // Continue to next middleware
  next();
}

module.exports = logger;

