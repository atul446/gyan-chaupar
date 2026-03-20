
// Gyan Chaupar - Core Logic (Nano Banana Edition)

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

const ladders = {
    3: 22, 8: 26, 15: 44, 21: 42, 28: 55, 36: 57, 48: 72, 63: 84, 71: 92, 80: 99
};

const snakes = {
    17: 5, 24: 6, 32: 10, 41: 19, 52: 29, 64: 38, 73: 51, 85: 58, 93: 68, 98: 79
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
    
    // Clear and add dynamic elements
    boardEl.innerHTML = '<svg id="connections" class="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 100"></svg>';
    
    let cellsHTML = '';
    for (let row = 9; row >= 0; row--) {
        let cols = [];
        for (let col = 1; col <= 10; col++) {
            cols.push(row * 10 + col);
        }
        if (row % 2 !== 0) cols.reverse();

        cols.forEach((num, index) => {
            const isCrimson = (row + (9 - index)) % 2 !== 0;
            const bgColor = isCrimson ? "bg-primary/10" : "bg-surface";
            const label = (snakes[num] ? 'मोह' : (ladders[num] ? 'सत्य' : 'धर्म'));
            
            cellsHTML += `
                <div class="aspect-square border border-primary/5 flex flex-col items-center justify-center p-1 ${bgColor} relative" data-cell="${num}">
                    <span class="absolute top-0.5 right-1 font-headline font-bold text-primary/30 text-[9px]">${num}</span>
                    <div class="font-serif text-[10px] sm:text-[12px] opacity-70 italic text-primary mt-2">
                        ${label}
                    </div>
                </div>`;
        });
    }
    boardEl.insertAdjacentHTML('beforeend', cellsHTML);
    drawConnections();
}

function getCoordinates(cell) {
    const zeroIndexed = cell - 1;
    const row = Math.floor(zeroIndexed / 10);
    let col;
    if (row % 2 === 0) col = zeroIndexed % 10;
    else col = 9 - (zeroIndexed % 10);
    return { x: col * 10 + 5, y: (9 - row) * 10 + 5 };
}

function drawConnections() {
    const svg = document.getElementById('connections');
    let html = '';

    for (let start in ladders) {
        let c1 = getCoordinates(parseInt(start));
        let c2 = getCoordinates(ladders[start]);
        html += drawLadder(c1.x, c1.y, c2.x, c2.y);
    }

    for (let start in snakes) {
        let c1 = getCoordinates(parseInt(start));
        let c2 = getCoordinates(snakes[start]);
        html += drawSnake(c1.x, c1.y, c2.x, c2.y);
    }
    svg.innerHTML = html;
}

function drawLadder(x1, y1, x2, y2) {
    const midX = (x1 + x2) / 2 + (y1 - y2) * 0.05;
    const midY = (y1 + y2) / 2 + (x2 - x1) * 0.05;
    const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    return `
        <g filter="drop-shadow(0 0 2px #735c00)">
            <path d="${pathD}" stroke="#735c00" stroke-width="1.2" fill="none" stroke-linecap="round" />
            <path d="${pathD}" stroke="#ffe088" stroke-width="0.3" fill="none" opacity="0.6" stroke-linecap="round" />
        </g>`;
}

function drawSnake(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const L = Math.sqrt(dx*dx + dy*dy);
    const nx = -dy/L, ny = dx/L;
    const bend = L * 0.22;
    const cx1 = x1 + dx * 0.35 + nx * bend;
    const cy1 = y1 + dy * 0.35 + ny * bend;
    const cx2 = x1 + dx * 0.65 - nx * bend;
    const cy2 = y1 + dy * 0.65 - ny * bend;
    const pathD = `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
    
    return `
        <g>
            <path d="${pathD}" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round" filter="drop-shadow(0 0 1.2px rgba(0, 86, 86, 0.8))" />
            <path d="${pathD}" fill="none" stroke="#66c6c6" stroke-width="0.4" stroke-dasharray="0.1 2.5" opacity="0.9" stroke-linecap="round" />
            <!-- Illustrative Head -->
            <circle cx="${x1}" cy="${y1}" r="1" fill="#111" />
            <circle cx="${x1}" cy="${y1}" r="0.3" fill="#0ff" filter="blur(0.2px)" />
        </g>`;
}

function updatePlayerTokens() {
    document.querySelectorAll('.player-token').forEach(el => el.remove());
    players.forEach((p, idx) => {
        const cell = document.querySelector(`[data-cell="${p.pos}"]`);
        if (!cell) return;
        const token = document.createElement('div');
        token.className = 'player-token absolute';
        token.style.backgroundColor = p.color;
        const offset = idx * 5;
        token.style.left = `calc(50% - 12px + ${offset - ((numPlayers-1)*2.5)}px)`;
        token.style.top = `calc(50% - 12px + ${offset - ((numPlayers-1)*2.5)}px)`;
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
    let targetPos = Math.min(100, startPos + dice);
    
    actionText.innerText = `Stepping ${dice} levels...`;
    
    for (let i = startPos + 1; i <= targetPos; i++) {
        p.pos = i;
        updatePlayerTokens();
        await new Promise(r => setTimeout(r, 300));
    }
    
    // Check for Snake/Ladder
    if (ladders[targetPos]) {
        actionText.innerText = "Virtue elevates the soul!";
        await new Promise(r => setTimeout(r, 600));
        p.pos = ladders[targetPos];
        updatePlayerTokens();
    } else if (snakes[targetPos]) {
        actionText.innerText = "Attachment binds the spirit...";
        await new Promise(r => setTimeout(r, 600));
        p.pos = snakes[targetPos];
        updatePlayerTokens();
    }
    
    if (p.pos >= 100) {
        actionText.innerText = `${p.name} achieves MOKSHA!`;
        return;
    }
    
    currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    updateTurnUI();
    isMoving = false;
    rollBtn.disabled = false;
    actionText.innerText = "Awaiting the next Seeker...";
}

rollBtn.addEventListener('click', () => {
    const dice = Math.floor(Math.random() * 6) + 1;
    movePlayer(dice);
});

document.querySelectorAll('.player-count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('border-primary', 'bg-primary/10'));
        btn.classList.add('border-primary', 'bg-primary/10');
        numPlayers = parseInt(btn.dataset.count);
        startGameBtn.classList.remove('hidden');
    });
});

startGameBtn.addEventListener('click', () => initGame(numPlayers));
