// Seed script to populate MongoDB with initial lesson data
// Run this once to set up the database with 10+ lessons

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'afterschool';

const lessons = [
  {
    subject: 'Math',
    location: 'London',
    price: 100,
    spaces: 5,
    icon: 'fa-calculator'
  },
  {
    subject: 'Math',
    location: 'Oxford',
    price: 100,
    spaces: 5,
    icon: 'fa-calculator'
  },
  {
    subject: 'Math',
    location: 'York',
    price: 80,
    spaces: 5,
    icon: 'fa-calculator'
  },
  {
    subject: 'English',
    location: 'London',
    price: 90,
    spaces: 5,
    icon: 'fa-book'
  },
  {
    subject: 'English',
    location: 'York',
    price: 85,
    spaces: 5,
    icon: 'fa-book'
  },
  {
    subject: 'English',
    location: 'Bristol',
    price: 95,
    spaces: 5,
    icon: 'fa-book'
  },
  {
    subject: 'Music',
    location: 'Bristol',
    price: 90,
    spaces: 5,
    icon: 'fa-music'
  },
  {
    subject: 'Music',
    location: 'Manchester',
    price: 85,
    spaces: 5,
    icon: 'fa-music'
  },
  {
    subject: 'Science',
    location: 'London',
    price: 110,
    spaces: 5,
    icon: 'fa-flask'
  },
  {
    subject: 'Science',
    location: 'Oxford',
    price: 120,
    spaces: 5,
    icon: 'fa-flask'
  },
  {
    subject: 'Art',
    location: 'Manchester',
    price: 75,
    spaces: 5,
    icon: 'fa-palette'
  },
  {
    subject: 'Art',
    location: 'Bristol',
    price: 80,
    spaces: 5,
    icon: 'fa-palette'
  }
];

async function seedDatabase() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    
    // Clear existing lessons
    console.log('Clearing existing lessons...');
    await db.collection('lessons').deleteMany({});
    
    // Insert new lessons
    console.log('Inserting lessons...');
    const result = await db.collection('lessons').insertMany(lessons);
    
    console.log(`✓ Successfully inserted ${result.insertedCount} lessons`);
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed');
    }
  }
}

seedDatabase();

