const boardEl = document.getElementById('game-board');
const diceEl = document.getElementById('dice');
const rollBtn = document.getElementById('roll-btn');
const posDisplay = document.getElementById('pos-display');
const stageDisplay = document.getElementById('stage-display');
const actionText = document.getElementById('action-text');
const karmaFill = document.getElementById('karma-fill');
const activePlayerName = document.getElementById('active-player-name');

let players = [];
let currentPlayerIndex = 0;
let numPlayers = 1;
let isMoving = false;

// Game Config
const TOTAL_TILES = 100;
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const availableAvatars = [
    { id: 'sadhu', name: 'The Ascetic', emoji: '🧘‍♂️', color: '#8a79ff', glow: 'rgba(138, 121, 255, 0.7)' },
    { id: 'raja', name: 'The King', emoji: '🤴', color: '#f9d877', glow: 'rgba(249, 216, 119, 0.7)' },
    { id: 'guru', name: 'The Teacher', emoji: '👩‍🏫', color: '#00ffaa', glow: 'rgba(0, 255, 170, 0.7)' },
    { id: 'balak', name: 'The Child', emoji: '🧒', color: '#ff4766', glow: 'rgba(255, 71, 102, 0.7)' }
];
let selectedAvatars = [];

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

function getCoordinates(cell) {
    const zeroIndexed = cell - 1;
    const row = Math.floor(zeroIndexed / 10);
    let col;
    if (row % 2 === 0) col = zeroIndexed % 10;
    else col = 9 - (zeroIndexed % 10);
    
    return { top: (9 - row) * 10, left: col * 10 };
}

function drawConnections() {
    let svgHTML = '';
    
    // Ladders (Green dashed line + up arrow)
    for (let start in ladders) {
        let end = ladders[start].to;
        let c1 = getCoordinates(parseInt(start));
        let c2 = getCoordinates(end);
        let cy1 = c1.top + 5, cx1 = c1.left + 5;
        let cy2 = c2.top + 5, cx2 = c2.left + 5;
        
        svgHTML += `<line x1="${cx1}" y1="${cy1}" x2="${cx2}" y2="${cy2}" stroke="rgba(0, 255, 170, 0.4)" stroke-width="0.8" stroke-dasharray="1"/>`;
        svgHTML += `<circle cx="${cx2}" cy="${cy2}" r="1" fill="var(--success)"/>`;
    }
    
    // Snakes (Red wavy/curved line + down arrow)
    for (let start in snakes) {
        let end = snakes[start].to;
        let c1 = getCoordinates(parseInt(start));
        let c2 = getCoordinates(end);
        let cy1 = c1.top + 5, cx1 = c1.left + 5;
        let cy2 = c2.top + 5, cx2 = c2.left + 5;
        
        let midx = (cx1 + cx2)/2 + 10;
        let midy = (cy1 + cy2)/2 - 10;
        svgHTML += `<path d="M ${cx1} ${cy1} Q ${midx} ${midy} ${cx2} ${cy2}" fill="none" stroke="rgba(255, 71, 102, 0.4)" stroke-width="0.8"/>`;
        svgHTML += `<circle cx="${cx2}" cy="${cy2}" r="1" fill="var(--danger)"/>`;
    }
    
    return `<svg id="connections" viewBox="0 0 100 100" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;">${svgHTML}</svg>`;
}

function initBoard() {
    let cellsHTML = drawConnections();
    
    for (let row = 9; row >= 0; row--) {
        let cols = [];
        for (let col = 1; col <= 10; col++) {
            cols.push(row * 10 + col);
        }
        if (row % 2 !== 0) cols.reverse();

        cols.forEach(num => {
            let cls = 'board-cell';
            let overlay = '';
            
            let stageIndex = Math.ceil(num / 20) - 1;
            cls += ` stage-${stageIndex}`;

            if (ladders[num]) {
                cls += ' has-ladder';
                overlay = `<span style="font-size:0.7em; opacity:0.8; display:block; margin-top:-5px; color:var(--success)">➔${ladders[num].to}</span>`;
            }
            if (snakes[num]) {
                cls += ' has-snake';
                overlay = `<span style="font-size:0.7em; opacity:0.8; display:block; margin-top:-5px; color:var(--danger)">➔${snakes[num].to}</span>`;
            }

            cellsHTML += `<div class="${cls}" data-cell="${num}">
                <div style="text-align:center;">
                    ${num}
                    ${overlay}
                </div>
            </div>`;
        });
    }
    boardEl.innerHTML = cellsHTML;
}

function updatePlayerPosition(pIndex, cell, instant = false) {
    const coords = getCoordinates(cell);
    const pToken = players[pIndex].tokenEl;
    
    // Add small offset to prevent exact overlapping
    const offsetLeft = pIndex * 4;
    const offsetTop = pIndex * 4;
    
    if(instant) {
        pToken.style.transition = 'none';
        pToken.style.left = `calc(${coords.left}% + ${offsetLeft}px)`;
        pToken.style.top = `calc(${coords.top}% + ${offsetTop}px)`;
        void pToken.offsetWidth;
        pToken.style.transition = 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else {
        pToken.style.left = `calc(${coords.left}% + ${offsetLeft}px)`;
        pToken.style.top = `calc(${coords.top}% + ${offsetTop}px)`;
    }
    
    if (pIndex === currentPlayerIndex) {
        posDisplay.innerText = cell;
        const stage = stages.find(s => cell <= s.max);
        stageDisplay.innerText = stage ? stage.name : 'Moksha';
    }
}

function updateKarma(pIndex, amount) {
    players[pIndex].karma = Math.max(0, Math.min(100, players[pIndex].karma + amount));
    if (pIndex === currentPlayerIndex) {
        karmaFill.style.width = `${players[pIndex].karma}%`;
    }
}

function updateUIForCurrentPlayer() {
    let av = players[currentPlayerIndex].avatar;
    activePlayerName.innerText = `${av.name}'s Turn`;
    activePlayerName.style.color = av.color;
    activePlayerName.style.textShadow = `0 0 10px ${av.glow}`;
    
    posDisplay.innerText = players[currentPlayerIndex].pos;
    const stage = stages.find(s => players[currentPlayerIndex].pos <= s.max);
    stageDisplay.innerText = stage ? stage.name : 'Moksha';
    karmaFill.style.width = `${players[currentPlayerIndex].karma}%`;
}

function nextTurn() {
    if (players.some(p => p.pos >= 100)) return; 
    
    currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    updateUIForCurrentPlayer();
    actionText.innerText = "Awaiting roll...";
    rollBtn.disabled = false;
}

function moveSequence(diceValue) {
    let p = players[currentPlayerIndex];
    let target = p.pos + diceValue;
    
    if (target > 100) {
        actionText.innerText = `Need exactly ${100 - p.pos} to reach Moksha!`;
        setTimeout(nextTurn, 1500);
        return;
    }

    actionText.innerText = `Moving to ${target}...`;
    p.pos = target;
    updatePlayerPosition(currentPlayerIndex, target);

    setTimeout(() => {
        if (ladders[target]) {
            handleEvent(ladders[target], 'ladder');
        } else if (snakes[target]) {
            handleEvent(snakes[target], 'snake');
        } else if (target === 100) {
            handleMoksha();
        } else {
            actionText.innerText = `Landed safely on ${target}.`;
            setTimeout(nextTurn, 1000);
        }
    }, 600);
}

function handleEvent(eventData, type) {
    let pIndex = currentPlayerIndex;
    showModal(eventData.name, eventData.desc, type === 'ladder' ? '🪜' : '🐍');
    
    if (type === 'ladder') {
        actionText.innerText = `Virtue! Ascending...`;
        actionText.style.color = 'var(--success)';
        boardEl.classList.add('board-ladder-glow');
        setTimeout(() => boardEl.classList.remove('board-ladder-glow'), 1500);
        updateKarma(pIndex, -15);
    } else {
        actionText.innerText = `Vice! Falling...`;
        actionText.style.color = 'var(--danger)';
        boardEl.classList.add('board-snake-glow');
        setTimeout(() => boardEl.classList.remove('board-snake-glow'), 1500);
        updateKarma(pIndex, 15);
    }

    setTimeout(() => {
        players[pIndex].pos = eventData.to;
        updatePlayerPosition(pIndex, eventData.to);
        setTimeout(() => { actionText.style.color = 'var(--success)'; }, 1000);
    }, 2000); 
}

function handleMoksha() {
    let av = players[currentPlayerIndex].avatar;
    showModal("Moksha", `${av.name} has broken the cycle of karma and attained absolute liberation. The game is complete!`, "✨");
    actionText.innerText = `${av.name} won!`;
    rollBtn.style.display = 'none';
    boardEl.style.boxShadow = "0 0 100px #fff";
    let token = players[currentPlayerIndex].tokenEl;
    token.style.background = "#fff";
    token.style.boxShadow = "0 0 30px 10px #fff";
    token.style.zIndex = "100";
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
    if (players[currentPlayerIndex].pos === 100) {
        document.getElementById('start-modal').style.display = 'flex';
        document.getElementById('main-ui').style.opacity = '0';
        document.getElementById('main-ui').style.pointerEvents = 'none';
    } else {
        nextTurn();
    }
});

rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    diceEl.classList.add('rolling');
    
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

// STARTUP - Avatar selection UI
const avatarContainer = document.getElementById('avatar-selection');
const beginBtn = document.getElementById('begin-journey-btn');

function renderAvatarSelection() {
    avatarContainer.innerHTML = '';
    availableAvatars.forEach(av => {
        let isSelected = selectedAvatars.find(a => a.id === av.id);
        avatarContainer.innerHTML += `
            <div class="avatar-card ${isSelected ? 'selected' : ''}" data-id="${av.id}">
                <div class="avatar-emoji">${av.emoji}</div>
                <div class="avatar-name" style="color:${av.color}">${av.name}</div>
            </div>`;
    });
    
    document.querySelectorAll('.avatar-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const existingIndex = selectedAvatars.findIndex(a => a.id === id);
            
            if (existingIndex >= 0) {
                selectedAvatars.splice(existingIndex, 1);
            } else if (selectedAvatars.length < 4) {
                selectedAvatars.push(availableAvatars.find(a => a.id === id));
            }
            
            renderAvatarSelection();
            if (selectedAvatars.length > 0) {
                beginBtn.disabled = false;
                beginBtn.style.opacity = '1';
            } else {
                beginBtn.disabled = true;
                beginBtn.style.opacity = '0.5';
            }
        });
    });
}

beginBtn.addEventListener('click', () => {
    numPlayers = selectedAvatars.length;
    initBoard();
    players = [];
    currentPlayerIndex = 0;
    
    selectedAvatars.forEach((av, i) => {
        let token = document.createElement('div');
        token.className = `player-token`;
        token.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), ${av.color}88)`;
        token.style.border = `2px solid ${av.color}`;
        token.style.boxShadow = `0 0 15px 5px ${av.glow}, inset -2px -2px 10px rgba(0,0,0,0.5)`;
        token.style.display = 'flex';
        token.style.justifyContent = 'center';
        token.style.alignItems = 'center';
        token.style.fontSize = '1.5rem';
        token.innerText = av.emoji;
        
        boardEl.appendChild(token);
        
        players.push({
            pos: 1,
            karma: 50,
            tokenEl: token,
            avatar: av
        });
        updatePlayerPosition(i, 1, true);
        updateKarma(i, 0);
    });
    
    updateUIForCurrentPlayer();
    
    document.getElementById('start-modal').style.display = 'none';
    document.getElementById('main-ui').style.opacity = '1';
    document.getElementById('main-ui').style.pointerEvents = 'auto';
    rollBtn.style.display = 'block';
    actionText.innerText = "Awaiting roll...";
    boardEl.style.boxShadow = "0 0 30px var(--purple-glow)";
});

renderAvatarSelection();
