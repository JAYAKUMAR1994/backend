// import { MongoClient } from 'mongodb';
// Example: Accessing MongoDB connection string from environment variable

// const mongoose = require('mongoose');
// const mongoDBUri = process.env.MONGODB_URI;
// require('dotenv').config();





// Rest of your application code...



// const { MongoClient } = require("mongodb");

// let database;

// async function connectToDatabase() {
//     const client = await MongoClient.connect('mongodb+srv://vjayakumar661:jaya8807@myapp.eqaklsd.mongodb.net/?retryWrites=true&w=majority');
//     database = client.db('library');

//     if (!database) {
//         console.log('Database not connected');
//     }
//     console.log('Database connected');
//     return database;
// }

// module.exports={ connectToDatabase };



// // Import necessary modules and packages
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables



// Access the MongoDB connection string from environment variable
// const mongoDBUri = process.env.MONGODB_URI;
const mongoDBUri = process.env.MONGODB_URI ;
console.log(mongoDBUri)
// process.env.MONGODB_URI = 'mongodb+srv://vjayakumar661:jaya8807@myapp.eqaklsd.mongodb.net/?retryWrites=true&w=majority';


// console.log('MongoDB URI:', mongoDBUri);
// MongoDB connection function
let database;


async function connectToDatabase() {
    try {
        // Connect to MongoDB using mongoose
        const client = await mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
        
        // Access the connected database with the specified name
        database = client.connection.getClient().db('library');

        // Check if the database is connected
        if (!database) {
            console.log('Database not connected');
        } else {
            console.log('Database connected');
        }

        return database;
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        throw error;
    }
}


// Export the connectToDatabase function and ObjectId
module.exports = { connectToDatabase };
