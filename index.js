const express = require('express')
const cors = require("cors");
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5005

// middleware
app.use(cors({
  origin:[
    'http://localhost:5173'
  ],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ide5est.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req,res,next)=>{
  console.log(req.method,req.url);
  next()
}

const verifyToken=(req,res,next)=>{
  const token = req?.cookies?.token
  if(!token){
    return res.status(401).send({message: 'Unauthorized access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'Unauthorized Access'})
    }
    req.user = decoded
    next()
  })
}


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

      app.post('/api/v1/user/booked-service',logger,verifyToken,async(req,res)=>{
        if(req.user.email !== req.query.email){
          return res.status(403).send({message:'forbidden access'})
        }
        const newBookedService = req.body
        const result = await BookedServiceCollection.insertOne(newBookedService)
        res.send(result)
      })

      app.get('/api/v1/user/booked-service',logger,verifyToken,async(req,res)=>{
        if(req.user.email !== req.query.email){
          return res.status(403).send({message:'forbidden access'})
        }
        const cursor = BookedServiceCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })

      app.patch('/api/v1/user/booked-service/:id',logger,async(req,res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updatedBooking = req.body
        const updatedDoc = {
          $set:{
            status:updatedBooking.status
          }
        }
        const result = await BookedServiceCollection.updateOne(filter,updatedDoc)
        res.send(result)
        console.log(updatedBooking);
      })
      app.patch('/api/v1/user/booked-service/:id',logger,async(req,res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updatedBooking = req.body
        const updatedDoc = {
          $set:{
            status:updatedBooking.status
          }
        }
        const result = await BookedServiceCollection.updateOne(filter,updatedDoc)
        res.send(result)
        console.log(updatedBooking);
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

      // auth relatd API
      app.post('/jwt',logger,verifyToken,async(req,res)=>{
        const user = req.body
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
        console.log('user for token',user);
        
        res.cookie('token',token,{
          httpOnly:true,
          secure:true,
          sameSite:'none'
        })
        
        .send({success:true})
      })

      app.post('/logout',async(req,res)=>{
        const user = req.body
        res.clearCookie('token',{maxAge: 0})
        .send({success:true})
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