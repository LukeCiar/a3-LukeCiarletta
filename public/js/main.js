// FRONT-END (CLIENT) JAVASCRIPT HERE

let scoreTable = null

//-1 = not modifying, number = modifying that index/id
let modifyingRow = -1
let modifyingId = -1

const submit = async (event) => {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const userName = document.querySelector('#userName').value,
          oppName = document.querySelector('#oppName').value,
          userScore = parseInt(document.querySelector('#userScore').value) | 0,
          oppScore = parseInt(document.querySelector('#oppScore').value) | 0,
          jsonData = { userName, oppName, userScore, oppScore }

    let response
    if(modifyingRow === -1) {
        //submtitting new data
        response = await fetch('/submit', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
    }
    else {
        //modifying existing data
        jsonData.modifyingId = modifyingId
        response = await fetch('/modify', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
        clearModifying()
    }

    const allGames = await response.json()
    updateScoreTable(allGames)
}

const deleteGame = async (id) => {
    //remove currently modifying row in case it is the one being deleted - otherwise modifying would break
    clearModifying()

    const response = await fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id})
    })

    const allGames = await response.json()
    updateScoreTable(allGames)
}

const clearModifying = () => { 
    if(modifyingRow != -1) { setModifying(modifyingRow, -1) }
}

const setModifying = (row, id) => {
    if(modifyingRow != -1 && modifyingRow != row) {
        //reset the currently modifying game (needed to avoid 2 button highlights)
        clearModifying()
    }
    
    //used to highlight the relevant modify button
    const button = scoreTable.children[row+1].children[6]
    const modifyInstructions = document.querySelector("#modifyInstructions")

    if(modifyingRow === row) {
        modifyingRow = -1
        modifyingId = -1
        button.className = ""
        modifyInstructions.className = "hidden"
    }
    else {
        modifyingRow = row
        modifyingId = id
        button.className = "modifying"
        modifyInstructions.className = ""
    }
}

const updateScoreTable = (allGames) => {
    scoreTable.innerHTML = `<tr>
        <th>Your Name</th>
        <th>Opponent's Name</th>
        <th>Your Score</th>
        <th>Opponent's Score</th>
        <th>Result</th>
        <th>Del.</th>
        <th>Mod.</th>
    </tr>` //last two headers are for delete and modify buttons

    for (let i = 0; i < allGames.length; i++) {
        let game = allGames[i]

        const deleteButton = document.createElement('button')
        deleteButton.innerHTML = '<img class="icon" src="../icons/delete.png" />'
        deleteButton.onclick = async () => { await deleteGame(game._id) }
        const deleteButtonCell = document.createElement('td')
        deleteButtonCell.appendChild(deleteButton)

        const modifyButton = document.createElement('button')
        modifyButton.innerHTML = '<img class="icon" src="../icons/modify.png" />'
        modifyButton.onclick = () => { setModifying(i, game._id) }
        const modifyButtonCell = document.createElement('td')
        modifyButtonCell.appendChild(modifyButton)

        const tr = document.createElement('tr')
        tr.innerHTML = `
        <td>${game.userName}</td>
        <td>${game.oppName}</td>
        <td>${game.userScore}</td>
        <td>${game.oppScore}</td>
        <td>${game.result}</td>
        `
        tr.appendChild(deleteButtonCell)
        tr.appendChild(modifyButtonCell)
        scoreTable.appendChild(tr)
    }

    document.querySelector('form').reset() //clear form
}

window.onload = async () => {
    //add submit function to the form instead of the button
        //so that default input validation works
    document.querySelector('form').onsubmit = submit

    scoreTable = document.createElement('table')
    document.body.append(scoreTable)

    let modifyText = document.createElement('p')
    modifyText.innerText = "To modify this game, enter the new details into the form and press submit."
    modifyText.className = "hidden"
    modifyText.id = "modifyInstructions"
    document.body.append(modifyText)

    const response = await fetch('/games', { method: 'GET' })
    const allGames = await response.json()
    updateScoreTable(allGames)
}
