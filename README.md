# After-School Lessons App - Backend

Express.js REST API for managing after-school lessons and orders.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (native driver)
- **Deployment**: Render.com

## API Endpoints

- `GET /lessons` - Get all lessons
- `GET /search?q={query}` - Search lessons (full-text search)
- `POST /orders` - Create new order
- `PUT /lessons/:id` - Update lesson spaces
- `GET /images/*` - Serve lesson images

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export MONGODB_URI="your_mongodb_connection_string"
```

3. Seed the database (first time only):
```bash
node seed.js
```

4. Start the server:
```bash
npm start
```

Server will run on `http://localhost:3000`

## Deployment

Deployed on Render.com at: **https://cst3144-backend-f7yf.onrender.com**

### Live API Endpoints:
- GET https://cst3144-backend-f7yf.onrender.com/lessons
- GET https://cst3144-backend-f7yf.onrender.com/search?q=math
- POST https://cst3144-backend-f7yf.onrender.com/orders
- PUT https://cst3144-backend-f7yf.onrender.com/lessons/:id

## GitHub Repository

Repository: https://github.com/mohammadamaankhan/cst3144-backend

