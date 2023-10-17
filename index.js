const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghkhwep.mongodb.net/?retryWrites=true&w=majority`;

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

        const coffeesCollection = client.db("allCoffeeDB").collection("coffee")

        app.get('/coffee', async (req, res) => {
            const cursor = coffeesCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeesCollection.findOne(query)
            res.send(result)
        })
        app.post('/coffee', async (req, res) => {
            const coffee = req.body
            console.log(coffee)
            const result = await coffeesCollection.insertOne(coffee)
            res.send(result)
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const coffee = req.body
            const updatedCoffee = {
                $set: {
                    name: coffee.name,
                    chef: coffee.chef,
                    supplier: coffee.supplier,
                    price: coffee.price,
                    category: coffee.category,
                    details: coffee.details,
                    photo: coffee.photo
                }

            }
            const result = await coffeesCollection.updateOne(filter,updatedCoffee,option)
            res.send(result)
        })

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeesCollection.deleteOne(query)
            res.redirect('/coffee');
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Localhost Running")
})

app.listen(port, () => {
    console.log(`The project running on port ${port}`)
})

