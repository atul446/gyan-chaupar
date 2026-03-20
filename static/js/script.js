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

// Audio Synthesizer (Native Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200 + Math.random()*400, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playLadderSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let notes = [440, 554, 659, 880, 1108]; // Ascending harmony
    notes.forEach((freq, i) => {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.6);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.6);
    });
}

function playSnakeSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
}

// Game Config
const diceFaces = ['<span class="material-symbols-outlined">filter_1</span>', '<span class="material-symbols-outlined">filter_2</span>', '<span class="material-symbols-outlined">filter_3</span>', '<span class="material-symbols-outlined">filter_4</span>', '<span class="material-symbols-outlined">filter_5</span>', '<span class="material-symbols-outlined">filter_6</span>'];

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
    let nx = -dy/L, ny = dx/L;
    let curvature = L * 0.15; // Golden arches

    let cx = (x1 + x2) / 2 + nx * curvature;
    let cy = (y1 + y2) / 2 + ny * curvature;

    const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

    let html = `
    <g filter="drop-shadow(0px 0px 8px #735c00)">
        <!-- Radiant rails -->
        <path d="${pathD}" fill="none" stroke="#735c00" stroke-width="1.8" stroke-linecap="round" />
        <path d="${pathD}" fill="none" stroke="#ffe088" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    </g>`;
    return html;
}

function drawRealSnake(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let L = Math.sqrt(dx*dx + dy*dy);
    let nx = -dy/L, ny = dx/L;
    let bend = L * 0.25; 

    // Handle head orientation and S-curves
    let cx1 = x1 + dx * 0.35 + nx * bend;
    let cy1 = y1 + dy * 0.35 + ny * bend;
    let cx2 = x1 + dx * 0.65 - nx * bend;
    let cy2 = y1 + dy * 0.65 - ny * bend;

    const pathD = `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;

    let html = `
    <g filter="drop-shadow(2px 8px 12px rgba(0,0,0,0.6))">
        <!-- Dense Charcoal Body -->
        <path d="${pathD}" fill="none" stroke="#111111" stroke-width="5.5" stroke-linecap="round" />
        <!-- Glowing Turquoise Pattern (Matching unnamed.jpg) -->
        <path d="${pathD}" fill="none" stroke="#00dada" stroke-width="2.2" stroke-dasharray="1.5 5" opacity="0.8" stroke-linecap="round" />
        <!-- Hand-inked crosshatching -->
        <path d="${pathD}" fill="none" stroke="#221b03" stroke-width="5.0" stroke-dasharray="0.5 1" opacity="0.3" />
    </g>
    `;

    // Calculate angles accurately for extremities
    let dirX = x1 - cx1, dirY = y1 - cy1;
    let ang = Math.atan2(dirY, dirX) * 180 / Math.PI;

    html += `
    <g transform="translate(${x1}, ${y1}) rotate(${ang})">
        <!-- Detailed Head (Deep Charcoal) -->
        <path d="M 0 -2 Q 3 -2.5 5 0 Q 3 2.5 0 2 Z" fill="#111111" stroke="#000" stroke-width="0.5"/>
        <!-- Luminescent Eyes -->
        <circle cx="2.5" cy="-1.2" r="0.6" fill="#0ff" filter="blur(1px)"/>
        <circle cx="2.5" cy="1.2" r="0.6" fill="#0ff" filter="blur(1px)"/>
    </g>
    `;

    return html;
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

        cols.forEach((num, index) => {
            const isCrimson = (row + index) % 2 === 0;
            const cls = `board-cell ${isCrimson ? 'cell-crimson' : 'cell-cream'} parchment-texture`;

            cellsHTML += `<div class="${cls}" data-cell="${num}">
                <div style="font-size: 0.75rem; font-weight: 900; position: absolute; top: 2px; left: 4px; opacity: 0.4;">
                    ${num}
                </div>
                <!-- Sanskrit Annotated Label (Stylized) -->
                <div style="font-size: 0.6rem; margin-top: 15px; opacity: 0.7; font-style: italic;">
                    ${ladders[num] ? 'सत्य' : (snakes[num] ? 'मोह' : 'धर्म')}
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
    // Position effect perfectly centered above the token (Token is ~60px, img is 250px)
    floatImg.style.left = `calc(${token.style.left} - 95px)`;
    floatImg.style.top = `calc(${token.style.top} - 120px)`;
    boardEl.appendChild(floatImg);
    
    if (type === 'ladder') {
        playLadderSound();
        actionText.innerText = `Virtue! Ascending...`;
        actionText.style.color = 'var(--success)';
        boardEl.classList.add('board-ladder-glow');
        token.classList.add('ladder-animation');
        
        floatImg.src = 'static/img/virtue_glow_1773935184066.png';
        
        updateKarma(pIndex, -15);
    } else {
        playSnakeSound();
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
        playTick();
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

// Keyboard Accessibility for Desktop (Space / Enter)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        // Prevent default browser scrolling when pressing space
        if (e.code === 'Space') {
            e.preventDefault();
        }
        
        const startModal = document.getElementById('start-modal');
        // 1. If start modal is open and the begin button is enabled
        if (startModal && startModal.style.display !== 'none') {
            if (!beginBtn.disabled) {
                beginBtn.click();
            }
        } 
        // 2. If an event modal is open
        else if (modal && !modal.classList.contains('hidden')) {
            modalClose.click();
        } 
        // 3. Otherwise, if the roll button is available and enabled
        else if (rollBtn && !rollBtn.disabled && rollBtn.style.display !== 'none') {
            rollBtn.click();
        }
    }
});
