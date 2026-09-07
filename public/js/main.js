// FRONT-END (CLIENT) JAVASCRIPT HERE

let scoreTable = null

//-1 = not modifying, index = modifying that index
let modifying = -1

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
    if(modifying === -1) {
        //submtitting new data
        response = await fetch('/submit', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
    }
    else {
        //modifying existing data
        jsonData.modifying = modifying
        response = await fetch('/modify', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
        setModifying(modifying) //reset to no longer be modifying
    }

    const allGames = await response.json()
    updateScoreTable(allGames)
}

const deleteGame = async (i) => {
    //remove currently modifying if is the one being deleted - breaks modifying feature otherwise
    if(modifying === i) { setModifying(i) }

    const response = await fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteIndex: i })
    })

    const allGames = await response.json()
    updateScoreTable(allGames)
}

const setModifying = (i) => {
    if(modifying != -1 && modifying != i) {
        //reset the currently modifying game (needed for button highlight)
        setModifying(modifying)
    }
    
    //used to highlight the relevant modify button
    const button = scoreTable.children[i+1].children[6]
    const modifyInstructions = document.querySelector("#modifyInstructions")

    if(modifying === i) {
        modifying = -1;
        button.className = ""
        modifyInstructions.className = "hidden"
    }
    else {
        modifying = i
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
        const deleteButton = document.createElement('button')
        deleteButton.innerHTML = '<img class="icon" src="../icons/delete.png" />'
        deleteButton.onclick = async () => await deleteGame(i)
        const deleteButtonCell = document.createElement('td')
        deleteButtonCell.appendChild(deleteButton)

        const modifyButton = document.createElement('button')
        modifyButton.innerHTML = '<img class="icon" src="../icons/modify.png" />'
        modifyButton.onclick = () => setModifying(i)
        const modifyButtonCell = document.createElement('td')
        modifyButtonCell.appendChild(modifyButton)

        game = allGames[i]
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

        document.querySelector('form').reset() //clear form
    }
}

window.onload = () => {
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
}
