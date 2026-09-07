require('dotenv').config()

const express = require("express"),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.use(express.static("public"))
app.use(express.json())

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

let collection = null

async function run() {
  await client.connect()
  collection = await client.db("a3").collection("game-data")

  // route to get all docs
  app.get("/docs", async (req, res) => {
    if (collection !== null) {
      const docs = await collection.find({}).toArray()
      res.json( docs )
    }
  })
}

run()

app.listen(3000)