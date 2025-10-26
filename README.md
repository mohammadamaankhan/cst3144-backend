# After-School Lessons App - Backend

This is the backend API for my CST3144 coursework project - an after-school lessons booking system built with Express.js and MongoDB.

**Student**: Mohammad Amaan Khan (M00986493)  
**Email**: MK2310@live.mdx.ac.uk  
**Module**: CST3144 - Full Stack Development

## Tech Stack

- **Runtime**: Node.js 20.18.0
- **Framework**: Express.js 5.x
- **Database**: MongoDB Atlas (native MongoDB driver)
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

## Live Deployment

My backend is deployed on Render.com and fully functional!

**Live URL**: https://cst3144-backend-f7yf.onrender.com

### Test the API:
You can test these endpoints directly in your browser or Postman:

- **GET** https://cst3144-backend-f7yf.onrender.com/lessons - Get all available lessons
- **GET** https://cst3144-backend-f7yf.onrender.com/search?q=math - Search for math lessons
- **POST** https://cst3144-backend-f7yf.onrender.com/orders - Create a new order
- **PUT** https://cst3144-backend-f7yf.onrender.com/lessons/:id - Update lesson availability

## Source Code

**GitHub Repository**: https://github.com/mohammadamaankhan/cst3144-backend

The repository contains all the source code with 10+ commits showing the development progression.

