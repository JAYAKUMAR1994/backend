
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require('cors'); // Import the cors middleware
const serverless = require('serverless-http')

const fs = require("fs");

const { connectToDatabase } = require("./db");
const { ObjectId } = require('mongodb');


const app = express();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });


app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const mobile = req.body.mobile; // Retrieve mobile from the request body
    const rate = req.body.rate; // Retrieve mobile from the request body
    const ram = req.body.ram; 
    const rom = req.body.rom; 
    const display = req.body.display; 
    const camera = req.body.camera; 
    const battery = req.body.battery; 
    const processor = req.body.processor; 
    const accessories = req.body.accessories; 

   
    const db = await connectToDatabase();
    const imagesCollection = db.collection('images');
    const result = await imagesCollection.insertOne({ imagePath, mobile, rate,ram,rom,display,camera,battery,processor,accessories });
    res.send({ insertId: result?.insertedId });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
});

app.use('/uploads', express.static('uploads'));

//load

app.get('/Load_Images', async (req, res) => {
  try {
      const db = await connectToDatabase();
    
      const imagesCollection = db.collection('images');
      const images = await imagesCollection.find({}).toArray();
     

      // Construct full URLs for the images
      images.forEach(image => {
          image.imageUrl = `${req?.protocol}://${req?.get('host')}/${image?.imagePath}`;
        
      });
res.send({image:images})

  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images');
  }
});

//delete

// app.delete('/image/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const db = await connectToDatabase();
//     const imagesCollection = db.collection('images');

//     const result = await imagesCollection.deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount === 1) {
//           // Delete corresponding file from the uploads folder
//           const imagePathToDelete = path.join(__dirname, result.value.imagePath);
//           console.log('path' - imagePathToDelete)
//           await fs.unlinkSync(imagePathToDelete);

//       res.send({ message: 'Image deleted successfully' });
//     } else {
//       res.status(404).send({ message: 'Image not found' });
//     }
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     res.status(500).json({ error: 'Error deleting image', details: error.message });
//   }
// });

app.delete('/image/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Deleting image with id:', id);

    const db = await connectToDatabase();
    const imagesCollection = db.collection('images');

    const result = await imagesCollection.findOneAndDelete({ _id: new ObjectId(id) });

    console.log('Database query result:', result);

    if (result._id) {
     

      // Replace backslashes with forward slashes in the file path
      const imagePathToDelete = path.join(__dirname, result.imagePath);
    
      // Check if imagePathToDelete is a directory
      const isDirectory = fs.statSync(imagePathToDelete).isDirectory();
    
      if (isDirectory) {
        // Remove the directory
        fs.rmdirSync(imagePathToDelete);
      } else {
        // Remove the file
        fs.unlinkSync(imagePathToDelete);
      }

      res.send({ message: 'Image deleted successfully' });
    } else {
     
      res.status(404).send({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Error deleting image', details: error.message });
  }
});



//load
// app.get('/Load_Books', async (req, res) => {
//   try {
//       const db = await connectToDatabase();
//       const imagesCollection = db.collection('books');
//       // console.log(imagesCollection)
//       const books = await imagesCollection.find({}).toArray();
// res.send({book:books})

//   } catch (error) {
//       console.error('Error fetching images:', error);
//       res.status(500).send('Error fetching images');
//   }
// });
app.get('/Load_Books', async (req, res) => {
  try {
      const db = await connectToDatabase();
      
      const imagesCollection = db.collection('books');
     
      const books = await imagesCollection.find({}).toArray();
      
      res.send({ book: books });
  } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).send('Error fetching books');
  }
});

//create

app.post('/store_book', async (req, res) => {

  try {
    const bookData = req.body;

    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const result = await booksCollection.insertOne(bookData);

  
      const allBooks = await booksCollection.find({}).toArray();

     

        res.status(201).json({books: allBooks });
   
 

    //  res.send({ insertId: result.insertedId });

  } catch (error) {
    console.error('Error create book:', error);
  }
});


//delete

app.delete('/book/:id', async (req, res) => {
  try {
    const id = req.params.id;

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

    res.status(200).json(updatedBook._id);


  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//end


//e-commerce

//create
app.use('/store_images', express.static('store_images'));

const ecomm_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'store_images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const store_images = multer({ storage: ecomm_storage });

app.post('/store_image', store_images.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const mobile = req.body.mobile; // Retrieve mobile from the request body
    const rate = req.body.rate; // Retrieve mobile from the request body
    const category = req.body.category
 

   
    const db = await connectToDatabase();
    const imagesCollection = db.collection('e-commerce');
    const result = await imagesCollection.insertOne({
      categories: [
        {
          name: category,
          products: [
            {
              imagePath: imagePath,
              mobile: mobile,
              rate: rate,
            },
          ],
        },
      ],
    });

    
    res.send({ insertId: result?.insertedId });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
});

app.use('/store_images', express.static('store_images'));

//load-ecommerce

app.get('/Load_EComm', async (req, res) => {
  try {
      const db = await connectToDatabase();
      
      const imagesCollection = db.collection('e-commerce');
      const images = await imagesCollection.find({}).toArray();
  

// Combine all categories into a single array
const allCategories = images.flatMap(imageObj => imageObj.categories);

// Update the imagePath property with the full URL for each product
allCategories.forEach(category => {
  category.products.forEach(product => {
    product.imagePath = `${req?.protocol}://${req?.get('host')}/${product.imagePath}`;
  });
});


// Send the response with the combined categories
res.send({ image: [allCategories] });

  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images');
  }
});

// last end //

const PORT =  process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// const corsOptions = {
//   origin: 'http://localhost:3000', // Replace with your React app's URL
//   optionSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const corsOptions = {
  origin: 'https://6586bdee4f64157ae8031758--celebrated-gelato-12a305.netlify.app',
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));


module.exports.handler = serverless(app)