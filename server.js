require('dotenv').config()
const express = require('express'),
      app = express(),
      { MongoClient, ObjectId } = require("mongodb"),
      port = process.env.PORT || 3000

const appData = []

app.use(express.static('public'))
app.use(express.json())

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)
let collection //will be set by middleware on first request

const setResult = (data) => {
    if(data.userScore > data.oppScore) { data.result = "Win" }
    else if(data.userScore < data.oppScore) { data.result = "Loss" }
    else { data.result = "Tie" }
}

const sendData = async (req, res) => {
    allGames = await getGames()
    res.status(200).send(allGames)
}

const getGames = async () => {
    const games = await collection.find().toArray()
    return games
}

const addGame = async (game) => {
    const id = await collection.insertOne(game)
}

const deleteGame = async (deleteId) => {
    const result = await collection.deleteOne({_id: new ObjectId(deleteId)})
}

const modifyGame = async (game) => {
    modifyingId = game.modifyingId
    delete game.modifyingId //prevent it from getting pushed to db
    const query = { _id: new ObjectId(modifyingId) }
    const result = await collection.replaceOne(query, game)
}

//make sure that collection is set on first request
app.use(async (req, res, next) => {
    if (!collection) { collection = await client.db("a3").collection("game-data") }
    next()
})

app.get('/games', sendData)

app.post('/submit', async (req, res) => {
    game = req.body
    setResult(game)
    await addGame(game)
    await sendData(req, res)
})

app.post('/delete', async (req, res) => {
    deleteId = req.body.id
    await deleteGame(deleteId)
    await sendData(req, res)
})

app.post('/modify', async (req, res) => {
    game = req.body
    setResult(game)
    await modifyGame(game)
    await sendData(res, res)
})

app.listen(port)
console.log("Listening on port " + port)
