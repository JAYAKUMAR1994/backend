
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require('cors'); // Import the cors middleware

const { connectToDatabase } = require("./db");
const { ObjectId } = require('mongodb');


const app = express();
app.use(express.json());
app.use(cors());

//load
app.get('/', async (req, res) => {
  try {
      const db = await connectToDatabase();
      const imagesCollection = db.collection('books');
      const books = await imagesCollection.find({}).toArray();
     
console.log(books)
     
res.send({book:books})

  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images');
  }
});

//create

app.post('/store_book', async (req, res) => {
  try {
    const bookData = req.body;

    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const result = await booksCollection.insertOne(bookData);
    res.send({ insertId: result.insertedId });
  } catch (error) {
    console.error('Error create book:', error);
  }
});


//delete

app.delete('/book/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Deleting book with ID:', id);
debugger
    const db = await connectToDatabase();
    const imagesCollection = db.collection('books');

    const result = await imagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.send({ message: 'book deleted successfully' });
    } else {
      res.status(404).send({ message: 'book not found' });
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Error deleting book', details: error.message });
  }
});

// Define the Book schema
const bookSchema = {
  title: String,
  author: String,
  address: {
    address1: String,
    address2: String,
  },
};

// Update a book by ID
app.put('/update_book/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const db = await connectToDatabase();
    
    const updatedBook = await db.collection('books').findOneAndUpdate(
      { _id: new ObjectId(bookId) },
      {
        $set: {
          title: req.body.title,
          author: req.body.author,
          address: {
            address1: req.body.address.address1,
            address2: req.body.address.address2,
          },
        },
      },
      { returnDocument: 'after' }
    );

    console.log('Updated Book:', updatedBook._id);
    // if (!updatedBook.value) {
    //   return res.status(404).json({ error: 'Book not found' });
    // }

    res.status(200).json(updatedBook._id);


  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//end

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your React app's URL
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));