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
    { id: 'sadhu', name: 'The Ascetic', imgSrc: 'static/img/avatar_ascetic_1773934187252.png', color: '#8a79ff', glow: 'rgba(138, 121, 255, 0.7)' },
    { id: 'raja', name: 'The King', imgSrc: 'static/img/avatar_king_1773934495950.png', color: '#f9d877', glow: 'rgba(249, 216, 119, 0.7)' },
    { id: 'guru', name: 'The Teacher', imgSrc: 'static/img/avatar_teacher_1773934540387.png', color: '#00ffaa', glow: 'rgba(0, 255, 170, 0.7)' },
    { id: 'balak', name: 'The Child', imgSrc: 'static/img/avatar_child_1773934674351.png', color: '#ff4766', glow: 'rgba(255, 71, 102, 0.7)' }
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

function drawRealLadder(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let L = Math.sqrt(dx*dx + dy*dy);
    let ux = dx/L, uy = dy/L;
    let nx = -uy, ny = ux;
    let W = 2.5; 
    
    let r1x1 = x1 + nx*W/2, r1y1 = y1 + ny*W/2;
    let r1x2 = x2 + nx*W/2, r1y2 = y2 + ny*W/2;
    let r2x1 = x1 - nx*W/2, r2y1 = y1 - ny*W/2;
    let r2x2 = x2 - nx*W/2, r2y2 = y2 - ny*W/2;
    
    let html = `
    <g filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.8)) drop-shadow(0px 0px 6px rgba(249, 216, 119, 0.8))">
        <line x1="${r1x1}" y1="${r1y1}" x2="${r1x2}" y2="${r1y2}" stroke="url(#ladder-grad)" stroke-width="0.8" stroke-linecap="round"/>
        <line x1="${r2x1}" y1="${r2y1}" x2="${r2x2}" y2="${r2y2}" stroke="url(#ladder-grad)" stroke-width="0.8" stroke-linecap="round"/>
    `;
    
    let rungSpacing = 2.5;
    let numRungs = Math.floor(L / rungSpacing);
    for (let i = 1; i < numRungs; i++) {
        let rx = x1 + ux * i * rungSpacing;
        let ry = y1 + uy * i * rungSpacing;
        let p1x = rx + nx*W/2, p1y = ry + ny*W/2;
        let p2x = rx - nx*W/2, p2y = ry - ny*W/2;
        html += `<line x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}" stroke="#d6a96e" stroke-width="0.6" stroke-linecap="round"/>`;
    }
    
    html += `</g>`;
    return html;
}

function drawRealSnake(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let L = Math.sqrt(dx*dx + dy*dy);
    
    let nx = -dy/L, ny = dx/L;
    let bend = L * 0.22; 
    
    let cx1 = x1 + dx * 0.33 + nx * bend;
    let cy1 = y1 + dy * 0.33 + ny * bend;
    
    let cx2 = x1 + dx * 0.66 - nx * bend;
    let cy2 = y1 + dy * 0.66 - ny * bend;
    
    let thickness = 3.5;
    
    let html = `
    <g filter="drop-shadow(0px 6px 4px rgba(0,0,0,0.8)) drop-shadow(0px 0px 8px rgba(255, 71, 102, 0.8))">
        <!-- Body base -->
        <path d="M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}" fill="none" stroke="url(#snake-grad)" stroke-width="${thickness}" stroke-linecap="round" />
        <!-- Body texture pattern (venomous stripes) -->
        <path d="M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}" fill="none" stroke="#ffcc00" stroke-width="1.2" stroke-dasharray="1.5,4" stroke-linecap="round" />
    `;
    
    let dirX = x1 - cx1;
    let dirY = y1 - cy1;
    let ang = Math.atan2(dirY, dirX) * 180 / Math.PI;
    
    let head = `
    <g transform="translate(${x1}, ${y1}) rotate(${ang})">
        <!-- Forked Tongue -->
        <path d="M 2.5 0 L 4 0 M 4 0 L 4.8 -0.6 M 4 0 L 4.8 0.6" stroke="#ff0000" stroke-width="0.3" fill="none" stroke-linecap="round" filter="drop-shadow(0px 0px 1px red)"/>
        <!-- Head Polygon -->
        <path d="M -1.5 -1.5 Q 0.5 -1.8 2.5 0 Q 0.5 1.8 -1.5 1.5 C -2.5 1 -2.5 -1 -1.5 -1.5 Z" fill="url(#snake-grad)" stroke="#220000" stroke-width="0.3"/>
        <!-- Glowing Eyes -->
        <circle cx="0.5" cy="-0.8" r="0.4" fill="#ffcc00" filter="drop-shadow(0 0 1px yellow)"/>
        <circle cx="0.5" cy="0.8" r="0.4" fill="#ffcc00" filter="drop-shadow(0 0 1px yellow)"/>
        <!-- Slit Pupils -->
        <ellipse cx="0.6" cy="-0.8" rx="0.1" ry="0.3" fill="black"/>
        <ellipse cx="0.6" cy="0.8" rx="0.1" ry="0.3" fill="black"/>
    </g>
    `;
    
    let tDirX = x2 - cx2;
    let tDirY = y2 - cy2;
    let tAng = Math.atan2(tDirY, tDirX) * 180 / Math.PI;
    
    let tail = `
    <g transform="translate(${x2}, ${y2}) rotate(${tAng})">
        <polygon points="-0.5,-1.75 4.5,0 -0.5,1.75" fill="#7a0018"/>
    </g>
    `;
    
    return html + tail + head + `</g>`;
}

function drawConnections() {
    let svgHTML = `
    <defs>
        <linearGradient id="snake-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff4766" />
            <stop offset="100%" stop-color="#7a0018" />
        </linearGradient>
        <linearGradient id="ladder-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f9d877" />
            <stop offset="100%" stop-color="#ab8220" />
        </linearGradient>
    </defs>
    `;
    
    for (let start in ladders) {
        let end = ladders[start].to;
        let c1 = getCoordinates(parseInt(start));
        let c2 = getCoordinates(end);
        let cy1 = c1.top + 5, cx1 = c1.left + 5;
        let cy2 = c2.top + 5, cx2 = c2.left + 5;
        svgHTML += drawRealLadder(cx1, cy1, cx2, cy2);
    }
    
    for (let start in snakes) {
        let end = snakes[start].to;
        let c1 = getCoordinates(parseInt(start));
        let c2 = getCoordinates(end);
        let cy1 = c1.top + 5, cx1 = c1.left + 5;
        let cy2 = c2.top + 5, cx2 = c2.left + 5;
        svgHTML += drawRealSnake(cx1, cy1, cx2, cy2);
    }
    
    return `<svg id="connections" viewBox="0 0 100 100" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5; opacity:0.75;">${svgHTML}</svg>`;
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
            
            let stageIndex = Math.ceil(num / 20) - 1;
            cls += ` stage-${stageIndex}`;

            if (ladders[num]) {
                cls += ' has-ladder';
            }
            if (snakes[num]) {
                cls += ' has-snake';
            }

            cellsHTML += `<div class="${cls}" data-cell="${num}">
                <div style="text-align:center;">
                    ${num}
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
    let token = players[pIndex].tokenEl;
    
    // Spawn Animated Image Effect
    let floatImg = document.createElement('img');
    floatImg.className = 'floating-img';
    // Position effect perfectly centered above the token
    floatImg.style.left = `calc(${token.style.left} - 60px)`;
    floatImg.style.top = `calc(${token.style.top} - 80px)`;
    boardEl.appendChild(floatImg);
    
    if (type === 'ladder') {
        actionText.innerText = `Virtue! Ascending...`;
        actionText.style.color = 'var(--success)';
        boardEl.classList.add('board-ladder-glow');
        token.classList.add('ladder-animation');
        
        floatImg.src = 'static/img/virtue_glow_1773935184066.png';
        
        updateKarma(pIndex, -15);
    } else {
        actionText.innerText = `Vice! Falling...`;
        actionText.style.color = 'var(--danger)';
        boardEl.classList.add('board-snake-glow');
        token.classList.add('snake-animation');
        
        floatImg.src = 'static/img/vice_snake_1773935357939.png';
        
        updateKarma(pIndex, 15);
    }

    setTimeout(() => floatImg.remove(), 1500);

    // Wait for the animation to finish before moving the piece and showing the modal
    setTimeout(() => {
        boardEl.classList.remove('board-ladder-glow', 'board-snake-glow');
        token.classList.remove('ladder-animation', 'snake-animation');
        
        showModal(eventData.name, eventData.desc, type === 'ladder' ? '🪜' : '🐍');
        
        players[pIndex].pos = eventData.to;
        updatePlayerPosition(pIndex, eventData.to);
        setTimeout(() => { actionText.style.color = 'var(--success)'; }, 1000);
        
    }, 1500); 
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
                <img src="${av.imgSrc}" alt="${av.name}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; margin-bottom:5px; border:2px solid ${av.color}; box-shadow: 0 0 10px ${av.glow}">
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
        token.style.backgroundImage = `url(${av.imgSrc})`;
        token.style.backgroundSize = `cover`;
        token.style.backgroundPosition = `center`;
        token.style.border = `2px solid ${av.color}`;
        token.style.boxShadow = `0 0 15px 5px ${av.glow}, inset -2px -2px 10px rgba(0,0,0,0.5)`;
        
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
