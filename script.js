/* ==========================================
   FLAPPY HIRONO GAME – FULL JS
   LARGE GAPS VERSION
========================================== */

/* ===== CONFIG ===== */
const CONFIG = {
    pipeSpeed: 80,            // slower pipes
    gravity: 400,             // slower falling bird
    jumpForce: 200,           // smaller jump, easier control
    pipeGapDesktop: 350,      // keep reasonable gap
    pipeGapMobile: 300,       
    pipeSpacingDesktop: 3.0,  // more space between pipes
    pipeSpacingMobile: 2.5
};

/* ===== ELEMENTS ===== */
const bird = document.querySelector('.hironobird');
const img = document.getElementById('bird');
const score_val = document.querySelector('.score_val');
const message = document.querySelector('.message');
const score_title = document.querySelector('.score_title');

/* ===== STATE ===== */
let game_state = 'Start';
let velocity = 0;
let lastTime = null;
let pipeTimer = 0;
let score = 0;

img.style.display = 'none';
message.classList.add('messageStyle');

/* ===== START GAME ===== */
function startGame() {
    if (game_state === 'Play') return;

    game_state = 'Play';
    velocity = 0;
    lastTime = null;
    pipeTimer = 0;
    score = 0;

    document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

    bird.style.top = '45vh';
    img.style.display = 'block';

    score_val.innerHTML = '0';
    score_title.innerHTML = 'Score : ';
    message.innerHTML = '';
    message.classList.remove('messageStyle');

    requestAnimationFrame(gameLoop);
}

/* ===== JUMP ===== */
function jump() {
    if (game_state !== 'Play') return;

    if (velocity > 200) velocity = 200;
    velocity = -CONFIG.jumpForce;
}

/* ===== CONTROLS ===== */
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') startGame();
    if (e.key === 'ArrowUp') jump();
});

document.addEventListener('click', () => {
    if (game_state !== 'Play') startGame();
    else jump();
});

document.addEventListener('touchstart', e => {
    e.preventDefault();
    if (game_state !== 'Play') startGame();
    else jump();
}, { passive: false });

/* ===== MAIN LOOP ===== */
function gameLoop(timestamp) {
    if (game_state !== 'Play') return;

    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    updateBird(delta);
    updatePipes(delta);
    createPipes(delta);

    requestAnimationFrame(gameLoop);
}

/* ===== BIRD PHYSICS ===== */
function updateBird(delta) {
    velocity += CONFIG.gravity * delta;
    const rect = bird.getBoundingClientRect();
    const newTop = rect.top + velocity * delta;
    bird.style.top = newTop + 'px';

    if (newTop <= 0 || rect.bottom >= window.innerHeight) {
        endGame();
    }
}

/* ===== PIPE MOVEMENT + COLLISION ===== */
function updatePipes(delta) {
    const pipes = document.querySelectorAll('.pipe_sprite');
    const birdRect = bird.getBoundingClientRect();

    pipes.forEach(pipe => {
        const rect = pipe.getBoundingClientRect();
        const newLeft = rect.left - CONFIG.pipeSpeed * delta;
        pipe.style.left = newLeft + 'px';

        if (rect.right < 0) pipe.remove();

        if (
            birdRect.left < rect.right &&
            birdRect.right > rect.left &&
            birdRect.top < rect.bottom &&
            birdRect.bottom > rect.top
        ) {
            endGame();
        }

        if (pipe.increase_score === '1' && rect.right < birdRect.left) {
            score++;
            score_val.innerHTML = score;
            pipe.increase_score = '0';
        }
    });
}

/* ===== PIPE CREATION – LARGE GAP ===== */
function createPipes(delta) {
    pipeTimer += delta;

    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? CONFIG.pipeSpacingMobile : CONFIG.pipeSpacingDesktop;

    if (pipeTimer < spacing) return;
    pipeTimer = 0;

    const gap = isMobile ? CONFIG.pipeGapMobile : CONFIG.pipeGapDesktop;
    const minPipeHeight = 50;
    const maxPipeHeight = window.innerHeight - gap - minPipeHeight;

    const topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
    const bottomHeight = window.innerHeight - gap - topHeight;

    // TOP PIPE
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe_sprite';
    topPipe.style.height = topHeight + 'px';
    topPipe.style.top = '0px';
    topPipe.style.left = '100vw';
    topPipe.increase_score = '0';
    document.body.appendChild(topPipe);

    // BOTTOM PIPE
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe_sprite';
    bottomPipe.style.height = bottomHeight + 'px';
    bottomPipe.style.top = topHeight + gap + 'px';
    bottomPipe.style.left = '100vw';
    bottomPipe.increase_score = '1';
    document.body.appendChild(bottomPipe);
}

/* ===== END GAME ===== */
function endGame() {
    game_state = 'End';
    img.style.display = 'none';
    message.innerHTML =
        '<span style="color:red;">Game Over</span><br>Press Enter / Tap to Restart';
    message.classList.add('messageStyle');
}