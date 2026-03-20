
// Sacred Jain Board - Core Logic (4K Edition)

const boardEl = document.getElementById('game-board');
const rollBtn = document.getElementById('roll-btn');
const actionText = document.getElementById('action-text');
const setupModal = document.getElementById('setup-modal');
const startGameBtn = document.getElementById('start-game');
const currentPlayerNameEl = document.getElementById('current-player-name');
const playerTurnIndicator = document.getElementById('player-turn-indicator');
const mainUI = document.getElementById('main-ui');

let numPlayers = 2;
let currentPlayerIndex = 0;
let players = [];
let isMoving = false;

// Jain Tradition: 7 Snakes and 3 Main Ladders mapped from board_jain.png
const ladders = {
    4: 58, 23: 67, 8: 80
};

const snakes = {
    74: 4, 79: 42, 61: 17, 44: 8, 28: 5, 21: 2
};

const playerColors = ['#6b0001', '#735c00', '#003838', '#8c716d'];

function initGame(count) {
    numPlayers = count;
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            id: i,
            name: `Seeker ${i + 1}`,
            pos: 1,
            color: playerColors[i]
        });
    }
    
    setupModal.style.display = 'none';
    mainUI.style.opacity = '1';
    initBoard();
    updatePlayerTokens();
    updateTurnUI();
}

function initBoard() {
    if (!boardEl) return;
    boardEl.innerHTML = '';
    
    let cellsHTML = '';
    const boardRows = 9;
    const boardCols = 9;

    // Generate the 9x9 grid (Rows 1-9)
    // Row 9 (top grid row) is 81..73, Row 1 (bottom grid row) is 1..9
    for (let row = boardRows - 1; row >= 0; row--) {
        let cols = [];
        for (let col = 1; col <= boardCols; col++) {
            cols.push(row * boardCols + col);
        }
        if (row % 2 !== 0) cols.reverse();

        cols.forEach((num) => {
            cellsHTML += `
                <div class="board-cell" data-cell="${num}">
                    <span class="cell-num">${num}</span>
                </div>`;
        });
    }

    // Wrap the grid inside a 9x9 container in HTML if needed, 
    // but the .board-overlay already does that.
    
    // For cells 82, 83, 84 (Siddhashila Area)
    // In our 9x10 grid, these will be in Row 10 (index 9)
    // We'll insert them manually or adjust the loop.
    
    // Actually, let's just use a single loop for 10 rows.
    // Row 0..8 = 9x9 grid. Row 9 = Siddhashila.
    boardEl.innerHTML = '';
    cellsHTML = '';

    // Row 9 is the top Row containing 82, 83, 84
    for (let row = 9; row >= 0; row--) {
        if (row === 9) {
            // Siddhashila Row (Special)
            for (let col = 1; col <= 9; col++) {
                if (col >= 4 && col <= 6) {
                    const num = 78 + col; // 4->82, 5->83, 6->84
                    cellsHTML += `<div class="board-cell" data-cell="${num}"></div>`;
                } else {
                    cellsHTML += `<div class="board-cell border-none bg-transparent"></div>`;
                }
            }
        } else {
            // Standard Grid
            let cols = [];
            for (let col = 1; col <= 9; col++) {
                cols.push(row * 9 + col);
            }
            if (row % 2 !== 0) cols.reverse();
            cols.forEach(num => {
                cellsHTML += `<div class="board-cell" data-cell="${num}"></div>`;
            });
        }
    }
    boardEl.innerHTML = cellsHTML;
}

function updatePlayerTokens() {
    document.querySelectorAll('.player-token').forEach(el => el.remove());
    players.forEach((p, idx) => {
        const cell = document.querySelector(`[data-cell="${p.pos}"]`);
        if (!cell) return;
        const token = document.createElement('div');
        token.className = 'player-token absolute';
        token.style.backgroundColor = p.color;
        const offset = idx * 4;
        token.style.left = `calc(50% - 11px + ${offset - ((numPlayers-1)*2)}px)`;
        token.style.top = `calc(50% - 11px + ${offset - ((numPlayers-1)*2)}px)`;
        cell.appendChild(token);
    });
}

function updateTurnUI() {
    const p = players[currentPlayerIndex];
    currentPlayerNameEl.innerText = p.name;
    playerTurnIndicator.style.backgroundColor = p.color;
}

async function movePlayer(dice) {
    if (isMoving) return;
    isMoving = true;
    rollBtn.disabled = true;
    
    let p = players[currentPlayerIndex];
    let startPos = p.pos;
    let targetPos = Math.min(84, startPos + dice);
    
    actionText.innerText = `The soul travels ${dice} steps...`;
    
    for (let i = startPos + 1; i <= targetPos; i++) {
        p.pos = i;
        updatePlayerTokens();
        await new Promise(r => setTimeout(r, 400));
    }
    
    // Teleports (Snake or Ladder)
    if (ladders[targetPos]) {
        actionText.innerText = "Right Conduct (Dharma) elevates you!";
        await new Promise(r => setTimeout(r, 800));
        p.pos = ladders[targetPos];
        updatePlayerTokens();
    } else if (snakes[targetPos]) {
        actionText.innerText = "Attachment (Moha) binds the spirit.";
        await new Promise(r => setTimeout(r, 800));
        p.pos = snakes[targetPos];
        updatePlayerTokens();
    }
    
    if (p.pos >= 84) {
        actionText.innerText = `${p.name} reaches SIDDHASHILA!`;
        return;
    }
    
    currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    updateTurnUI();
    isMoving = false;
    rollBtn.disabled = false;
    actionText.innerText = "Seek the next level.";
}

rollBtn.addEventListener('click', () => {
    const dice = Math.floor(Math.random() * 6) + 1;
    movePlayer(dice);
});

document.querySelectorAll('.player-count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('border-primary', 'bg-primary/20'));
        btn.classList.add('border-primary', 'bg-primary/20');
        numPlayers = parseInt(btn.dataset.count);
        startGameBtn.classList.remove('hidden');
    });
});

startGameBtn.addEventListener('click', () => initGame(numPlayers));
