const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

// middleware 
app.use(cors());
app.use(express.json());


// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.4ayta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4ayta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // database 
        const database = client.db("EspressoEmporium");
        // coffees collection 
        const coffees = database.collection("coffees");
        // users collection
        const users = database.collection("users");


        app.get("/", async (req, res) => {
            res.send("Espresso Emporium");
        })
        // all coffees related request API
        // get all coffees METHOD
        app.get('/coffees', async (req, res) => {
            const cursor = coffees.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // add coffees METHOD  
        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffees.insertOne(newCoffee)
            res.send({ status: true, data: newCoffee, result });
        })
        // single coffee METHOD
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffees.findOne(query);
            console.log(result);
            res.send(result)
        })
        // update a coffee info METHOD 
        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const updateCoffeeData = req.body;
            const query = { _id: new ObjectId(id) };
            const updatedCoffeeData = {
                $set: {
                    name: updateCoffeeData.name,
                    quantity: updateCoffeeData.quantity,
                    supplier: updateCoffeeData.supplier,
                    taste: updateCoffeeData.taste,
                    category: updateCoffeeData.category,
                    price: updateCoffeeData.price,
                    details: updateCoffeeData.details,
                    photo: updateCoffeeData.photo,
                }
            }
            const result = await coffees.updateOne(query, updatedCoffeeData);
            res.send({ status: true, updatedData: result });
        })
        // delete a coffee METHOD 
        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffees.deleteOne(query);
            res.send(result)
        })

        // all users related request api 
        // add user info 
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log("Creating New User: ", newUser);
            const result = await users.insertOne(newUser);
            res.send({ status: true, insertedData: result, body: newUser });
        })
        // to get all users 
        app.get('/users', async (req, res) => {
            const cursor = users.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        // single user 
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await users.findOne(query);
            // console.log(result);
            res.send(result)
        })
        // update user 
        app.put('/users/:id', async (req, res) => {
            const user = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedUser = {
                $set: {
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: user.createdAt
                }
            }
            const result = await users.updateOne(query, updatedUser);
            res.send({ status: true, result: result, updatedData: user });
        })
        // patch user 
        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const query = { email };
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }
            const result = await users.updateOne(query, updatedDoc);
            res.send({ status: true, result: result });
        })
        // to delete specific user 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await users.deleteOne(query);
            res.send({ status: true, deletedUserId: id, result: result });
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB Yaah!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log("Server is running on port ", port);
});

