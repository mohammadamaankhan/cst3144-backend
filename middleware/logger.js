// Logger middleware - logs all incoming requests
// Marks: 4% of total coursework

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

module.exports = logger;

