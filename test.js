const {MongoClient} = require('mongodb')

let database;

async function connectToDatabase(){

    const client = await MongoClient.connect('')
    database = client.db('')

    if(!database){
        console.log('database not connected')
    }
    return database
}

module.exports = {connectToDatabase}

const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb')

const app = express()

app.use(express.json())

app.get('/',async (req,res)=>{
try{
    const db = await connectToDatabase()
    const bookCollection = db.collection('')
    const response = await bookCollection.find({}).toArray()
    res.send({book:response})

}
 catch(err){
console.error('fetching book error',err)
 } 
})

app.post('/book',async(req,res)=>{
    try{

        const bookData = req.body
        const db = await connectToDatabase()
        const bookCollection = db.collection('')
        const response =await bookCollection.insertOne(bookData)

        
    }catch(err){
console.error('create book error',err)
    }
})

app.put('/book/:id',async(req,res)=>{
    try{
        const id = req.params.id
        const db = await connectToDatabase();
        const result =await db.collection('').findOneAndUpdate(
            {_id : new ObjectId(id)},
            {$set :{
                title:req.body.title
            }},
            {returnDocument :'after'}
        )
    }catch(err){
        console.error('update book error',err)
    }
})

app.delete('/book/:id',async(req,res)=>{
    try{
        const id = req.params.id
       const db = await connectToDatabase()
       const response = await db.collection('').deleteOne({_id:new ObjectId(id)})

       if(response.deletedCount === 1){
res.send({message:'book deleted Successfully'})
       }else{
        res.status(404).send({message:'book not found'})
       }
    }catch(err){
console.error('delete book error',err)
    }
})

const PORT = 3001;

app.listen(PORT,()=>{
    console.log(`server running on PORT ${PORT}`)
})

const corsOptions ={
    origin :'http://localhost:3000',
    optionSuccessStatus:200
}

app.use(cors(corsOptions))