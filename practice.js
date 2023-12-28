const {MongoClient, ObjectId} = require('mongodb')

let database;

async function connectToDataBase(){

    const Client =await  MongoClient.connect('mongodb://localhost:27017/')
    database = Client.db('')
    if(!database){
        console.log('not connected')
    }

    return database
}

module.exports={connectToDataBase}

const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb')
const app = express()

app.use(express.json())

app.get('/books',async(req,res)=>{
    try{

        const db =await connectToDataBase()
        const bookCollection = db.collection('books')
        const response = await bookCollection.find({}).toArray()

        res.send({book:response})
    }catch(err){
console.error('fetching book error',err)
    }
})

app.post('/book',async(req,res)=>{
    try{
const bookData = req.body
const db = await connectToDataBase()
const bookCollection=db.collection("books")
const response =await bookCollection.insertOne(bookData)

res.send({id:response?.insertedId})
    }catch(err){
console.log('create book error',err)
    }
})


app.put('/book/:id',async(req,res)=>{
    try{
        let id = req.params.id
const db = await connectToDataBase()
const response = await db.collection('books').findOneAndUpdate(
    {_id:new ObjectId(id)},
    {$set:{
        title:req.body.title
    }},
    {returnDocument:'after'}
)
    }catch(err){
console.log('update book error',err)
    }
})

app.delete('/book/:id',async(req,res)=>{
    try{

        let id = req.params.id
        const db = await connectToDataBase()
        const response =await db.collection('books').deleteOne({_id:new Object(id)})

    }catch(err){
        console.log('delete book error',err)
    }
})


const PORT = 3001;

app.listen(PORT,()=>{
    console.log(`server running on PORT${PORT}`)
})

const corsOptions ={
    origin:'http://localhost:3000',
    optionSuccessStatus:200
}

app.use(cors(corsOptions))