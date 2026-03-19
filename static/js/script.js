const boardEl = document.getElementById('game-board');
const playerToken = document.getElementById('player');
const diceEl = document.getElementById('dice');
const rollBtn = document.getElementById('roll-btn');
const posDisplay = document.getElementById('pos-display');
const stageDisplay = document.getElementById('stage-display');
const actionText = document.getElementById('action-text');
const karmaFill = document.getElementById('karma-fill');

let currentPos = 1;
let currentKarma = 50; // 0 to 100, 50 is neutral
let isMoving = false;

// Game Config
const TOTAL_TILES = 100;
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const ladders = {
    3: { to: 22, name: "Curiosity", desc: "Curiosity is the beginning of learning. The search for truth elevates your soul." },
    8: { to: 26, name: "Satya", desc: "Truth (Satya) builds trust and removes fear. A clear path opens before you." },
    15: { to: 44, name: "Ahimsa", desc: "Non-violence (Ahimsa) is the supreme religion. Your compassionate heart leads to massive spiritual growth." },
    21: { to: 42, name: "Right Faith", desc: "Samyak Darshan (Right Faith). Believing in the true nature of reality propels you." },
    28: { to: 55, name: "Charity", desc: "Selfless giving (Daan) detaches you from material wealth and brings immense joy." },
    36: { to: 57, name: "Self-discipline", desc: "Sanyam (Self-discipline) helps you harness your energy and transcend worldly desires." },
    48: { to: 72, name: "Aparigraha", desc: "Non-possessiveness (Aparigraha) makes your soul light and free. The burden lifts." },
    63: { to: 84, name: "Meditation", desc: "Dhyan (Meditation) burns old karmas and brings razor-sharp focus." },
    71: { to: 92, name: "Forgiveness", desc: "Kshama (Forgiveness) dissolves all anger and knots of the heart. You soar high." },
    80: { to: 99, name: "Detachment", desc: "Vairagya (Detachment). You observe the world but remain untouched. The final threshold is near." },
};

const snakes = {
    17: { to: 5, name: "Anger", desc: "Krodh (Anger) burns you from within. It destroys relationships and binds dark karma." },
    24: { to: 6, name: "Greed", desc: "Lobh (Greed) never satisfies. The more you have, the more you want. You fall." },
    32: { to: 10, name: "Ego", desc: "Ahankar (Ego) blinds you to reality. Pride comes before a heavy fall." },
    41: { to: 19, name: "Deceit", desc: "Maya (Deceit) tangles your soul in a web of lies. Transparency is lost." },
    52: { to: 29, name: "Attachment", desc: "Moha (Attachment) to people or things is the root cause of deep suffering." },
    64: { to: 38, name: "Pride", desc: "Maan (Intellectual Pride). Thinking you know everything blocks true knowledge." },
    73: { to: 51, name: "Violence", desc: "Himsa (Violence) in words or thoughts degrades your spiritual progress severely." },
    85: { to: 58, name: "Delusion", desc: "Mithyatva (Delusion). Believing the unreal to be real. A dangerous setback." },
    93: { to: 68, name: "Jealousy", desc: "Irshya (Jealousy) poisons your own mind while the object of jealousy remains unaffected." },
    98: { to: 79, name: "Desire", desc: "Trishna (Unfulfilled Desire). So close to liberation, yet worldly pulls drag you down." },
};

const stages = [
    { max: 20, name: 'Mithyatva (Ignorance)' },
    { max: 40, name: 'Awakening' },
    { max: 60, name: 'Discipline' },
    { max: 80, name: 'Renunciation' },
    { max: 100, name: 'Keval Gyan (Omniscience)' }
];

function initBoard() {
    // We append cells visually from row 9 down to row 0
    let cellsHTML = '';
    for (let row = 9; row >= 0; row--) {
        let cols = [];
        for (let col = 1; col <= 10; col++) {
            cols.push(row * 10 + col);
        }
        if (row % 2 !== 0) cols.reverse();

        cols.forEach(num => {
            let cls = 'board-cell';
            let overlay = '';
            
            // Determine stage color
            let stageIndex = Math.ceil(num / 20) - 1;
            cls += ` stage-${stageIndex}`;

            if (ladders[num]) {
                cls += ' has-ladder';
                overlay = '<span style="font-size:0.8em; opacity:0.8">🪜</span>';
            }
            if (snakes[num]) {
                cls += ' has-snake';
                overlay = '<span style="font-size:0.8em; opacity:0.8">🐍</span>';
            }

            cellsHTML += `<div class="${cls}" data-cell="${num}">
                ${num} <div style="position:absolute; bottom:2px; right:2px">${overlay}</div>
            </div>`;
        });
    }
    boardEl.innerHTML = cellsHTML;
    boardEl.appendChild(playerToken); // re-append token
    
    updatePlayerPosition(1, true); // Instant move to 1
}

function getCoordinates(cell) {
    // cell: 1 to 100
    const zeroIndexed = cell - 1;
    const row = Math.floor(zeroIndexed / 10);
    
    let col;
    if (row % 2 === 0) {
        col = zeroIndexed % 10; // Left to right
    } else {
        col = 9 - (zeroIndexed % 10); // Right to left
    }
    
    const topPercent = (9 - row) * 10;
    const leftPercent = col * 10;
    return { top: `${topPercent}%`, left: `${leftPercent}%` };
}

function updatePlayerPosition(cell, instant = false) {
    const coords = getCoordinates(cell);
    if(instant) {
        playerToken.style.transition = 'none';
        playerToken.style.left = coords.left;
        playerToken.style.top = coords.top;
        // Force reflow
        void playerToken.offsetWidth;
        playerToken.style.transition = 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else {
        playerToken.style.left = coords.left;
        playerToken.style.top = coords.top;
    }
    
    posDisplay.innerText = cell;
    
    const stage = stages.find(s => cell <= s.max);
    stageDisplay.innerText = stage ? stage.name : 'Moksha';
}

function updateKarma(amount) {
    currentKarma = Math.max(0, Math.min(100, currentKarma + amount));
    karmaFill.style.width = `${currentKarma}%`;
}

function moveSequence(diceValue) {
    let target = currentPos + diceValue;
    if (target > 100) {
        actionText.innerText = `Need exactly ${100 - currentPos} to reach Moksha!`;
        rollBtn.disabled = false;
        return;
    }

    actionText.innerText = `Moving to ${target}...`;
    currentPos = target;
    updatePlayerPosition(currentPos);

    setTimeout(() => {
        if (ladders[currentPos]) {
            handleEvent(ladders[currentPos], 'ladder');
        } else if (snakes[currentPos]) {
            handleEvent(snakes[currentPos], 'snake');
        } else if (currentPos === 100) {
            handleMoksha();
        } else {
            actionText.innerText = `Landed safely on ${currentPos}.`;
            rollBtn.disabled = false;
        }
    }, 600); // Wait for CSS transition
}

function handleEvent(eventData, type) {
    showModal(eventData.name, eventData.desc, type === 'ladder' ? '🪜' : '🐍');
    
    if (type === 'ladder') {
        actionText.innerText = `Virtue! Ascending...`;
        actionText.style.color = 'var(--success)';
        boardEl.classList.add('board-ladder-glow');
        setTimeout(() => boardEl.classList.remove('board-ladder-glow'), 1500);
        updateKarma(-15); // Good
    } else {
        actionText.innerText = `Vice! Falling...`;
        actionText.style.color = 'var(--danger)';
        boardEl.classList.add('board-snake-glow');
        setTimeout(() => boardEl.classList.remove('board-snake-glow'), 1500);
        updateKarma(15); // Bad
    }

    // Move to destination after modal displays
    setTimeout(() => {
        currentPos = eventData.to;
        updatePlayerPosition(currentPos);
        setTimeout(() => { actionText.style.color = 'var(--success)'; }, 1000);
    }, 2000); // Delay movement so player reads modal
}

function handleMoksha() {
    showModal("Moksha", "You have broken the cycle of karma and attained absolute liberation. The game is complete.", "✨");
    actionText.innerText = "Game Completed.";
    rollBtn.style.display = 'none';
    boardEl.style.boxShadow = "0 0 100px #fff";
    playerToken.style.background = "#fff";
    playerToken.style.boxShadow = "0 0 30px 10px #fff";
}

// Modal logic
const modal = document.getElementById('event-modal');
const modalTitle = document.getElementById('modal-title');
const modalIcon = document.getElementById('modal-icon');
const modalDesc = document.getElementById('modal-desc');
const modalClose = document.getElementById('modal-close');

function showModal(title, desc, icon) {
    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modalIcon.innerText = icon;
    modal.classList.remove('hidden');
    modalClose.innerText = "Acknowledge";
    if (icon === "✨") modalClose.innerText = "Restart Journey";
}

modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (currentPos === 100) {
        // Restart logic
        currentPos = 1;
        updateKarma(0);
        currentKarma = 50;
        updateKarma(0);
        updatePlayerPosition(1, true);
        rollBtn.style.display = 'block';
        actionText.innerText = "Awaiting roll...";
        boardEl.style.boxShadow = "0 0 30px var(--purple-glow)";
        playerToken.style.background = "radial-gradient(circle at 30% 30%, #fff, #8a79ff)";
        playerToken.style.boxShadow = "0 0 15px 5px var(--purple-glow), inset -2px -2px 10px rgba(0,0,0,0.5)";
    }
    rollBtn.disabled = false;
});

// Controls
rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    diceEl.classList.add('rolling');
    
    // Simulate dice roll animation
    let count = 0;
    const interval = setInterval(() => {
        diceEl.innerText = diceFaces[Math.floor(Math.random() * 6)];
        count++;
        if (count > 10) {
            clearInterval(interval);
            diceEl.classList.remove('rolling');
            
            const roll = Math.floor(Math.random() * 6) + 1;
            diceEl.innerText = diceFaces[roll - 1];
            actionText.innerText = `Rolled a ${roll}!`;
            
            setTimeout(() => { moveSequence(roll); }, 400);
        }
    }, 50);
});

// Startup
initBoard();
updateKarma(0); // init bar UI
