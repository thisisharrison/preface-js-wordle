import './style.css'

const chars = Array.from({ length: 30 })

function buildGrid() {
    const wrapper = document.createElement('div')
    wrapper.id = 'board'
    let row = document.createElement('div')
    row.className = 'row'
    chars.forEach((_, i) => {
        if (i % 5 === 0 && i !== 0) {
            wrapper.appendChild(row)
            row = document.createElement('div')
            row.className = 'row'
        }
        const tile = document.createElement('div')
        tile.className = 'tile'
        row.appendChild(tile)
    })
    wrapper.appendChild(row)
    document.body.appendChild(wrapper)
}

function bindKeyboard() {
    document.addEventListener('keydown', (event) => {
        const regex = new RegExp("^[a-zA-Z]$")
        const key = event.key
        const tiles = document.querySelectorAll('.tile')
        const next = chars.findIndex(_ => _ === undefined)
        if (next % 5 === 0 && next !== 0) return
        if (regex.test(key)) {
            tiles[next].textContent = key
            chars[next] = key
        } else if (key === "Backspace") {
            tiles[next - 1].textContent = undefined
            chars[next - 1] = undefined
        } else if (key === "Enter") {
            return
        } else {
            event.preventDefault()
        }
    })
}

function startGame() {
    bindKeyboard()
}


buildGrid()
startGame()
