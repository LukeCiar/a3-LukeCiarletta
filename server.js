const express = require('express'),
      app = express(),
      port = process.env.PORT || 3000

const appData = []

app.use(express.static('public'))
app.use(express.json())

const sendData = (req, res) => {
    res.status(200).send(appData)
}

app.post('/submit', (req, res) => {
    data = req.body
    setResult(data)
    appData.push(data)
    sendData(req, res)
})

app.post('/delete', (req, res) => {
    index = req.body.deleteIndex
    appData.splice(index, 1)
    sendData(req, res)
})

app.post('/modify', (req, res) => {
    data = req.body
    setResult(data)

    //pull out the index to modify and prevent it from getting saved
    index = data.modifying
    delete data.modifying

    appData.splice(index, 1, data)
    sendData(res, res)
})

const setResult = (data) => {
    if(data.userScore > data.oppScore) { data.result = "Win" }
    else if(data.userScore < data.oppScore) { data.result = "Loss" }
    else { data.result = "Tie" }
}

app.listen(port)
console.log("Listening on port " + port)
