const express = require('express')
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5005

// middleware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ide5est.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();

    const serviceCollection = client.db('tranquoasisDB').collection('services')
    const BookedServiceCollection = client.db('tranquoasisDB').collection('BookedServices')

    // service related API

    app.get('/api/v1/services',async(req,res)=>{
        const cursor = serviceCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.post('/api/v1/services',async(req,res)=>{
        const newServices = req.body
        console.log(newServices);
        const result = await serviceCollection.insertOne(newServices)
        res.send(result)
      })

      app.get('/api/v1/services/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id:new ObjectId(id)}
        const result = await serviceCollection.findOne(query)
        res.send(result)
      })

      // booking related API

      app.post('/api/v1/user/booked-service',async(req,res)=>{
        const newBookedService = req.body
        const result = await BookedServiceCollection.insertOne(newBookedService)
        res.send(result)
      })

      app.put('/api/v1/services/:id',async(req,res)=>{
        const id = req.params.id
        const service = req.body
        console.log(service);
        const filter = {_id: new ObjectId(id)}
        const options= {upsert:true}
        const updatedService = {
          $set:{
            serviceName:service.serviceName,
            yourName:service.yourName,
            yourEmail:service.yourEmail,
            price:service.price,
            serviceArea:service.serviceArea,
            description:service.description,
            photo:service.photo,
          }
        }
        const result =await serviceCollection.updateOne(filter,updatedService,options)
        res.send(result)
      })

      app.delete('/api/v1/services/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id:new ObjectId(id)}
        const result = await serviceCollection.deleteOne(query)
        res.send(result)
      })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})