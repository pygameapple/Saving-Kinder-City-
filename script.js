const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Prevent double-tap zoom on mobile
let lastTouch = 0;
document.addEventListener('touchstart', function(e){
    let now = (new Date()).getTime();
    if(now - lastTouch <= 300){
        e.preventDefault();
    }
    lastTouch = now;
}, {passive:false});

// Optional: prevent pinch zoom
document.addEventListener('gesturestart', function(e){ e.preventDefault(); });

let ship = { x: canvas.width/2, y: canvas.height/2, speed: 5 };
let shootDir = {x:0, y:-1};
let bullets = [];
let fires = [];
let keys = {};
let score = 0;
let highScore = 0;
let gameOver = false;

/* Images */
const fireImg = new Image();
fireImg.src = "images/asteroid.png";
const shipImg = new Image();
shipImg.src = "images/ship.png";

/* START SCREEN LOGIC */
const startScreen = document.getElementById("startScreen");
let gameStarted = false;

function startGame(){
    startScreen.style.display = "none";
    gameStarted = true;
}

document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if(!gameStarted && e.key===" ") startGame();
    if(gameOver && e.key===" ") resetGame();
});
document.addEventListener("keyup", e => keys[e.key]=false);
startScreen.addEventListener("touchstart", startGame);

/* Fire spawn */
function spawnFire(size=60){
    fires.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        size: size,
        dx: (Math.random()-0.5)*2,
        dy: (Math.random()-0.5)*2
    });
}

for(let i=0;i<3;i++) spawnFire();
let fireTimer=0;

function update(){
    if(!gameStarted || gameOver) return;

    if(keys["ArrowLeft"]){ ship.x-=ship.speed; shootDir={x:-1,y:0}; }
    if(keys["ArrowRight"]){ ship.x+=ship.speed; shootDir={x:1,y:0}; }
    if(keys["ArrowUp"]){ ship.y-=ship.speed; shootDir={x:0,y:-1}; }
    if(keys["ArrowDown"]){ ship.y+=ship.speed; shootDir={x:0,y:1}; }

    ship.x = Math.max(60, Math.min(canvas.width-60, ship.x));
    ship.y = Math.max(60, Math.min(canvas.height-60, ship.y));

    if(keys[" "]){
        bullets.push({ x:ship.x, y:ship.y, dx:shootDir.x*12, dy:shootDir.y*12 });
        keys[" "] = false;
    }

    bullets.forEach(b => { b.x+=b.dx; b.y+=b.dy; });

    fireTimer++;
    if(fireTimer>120){ spawnFire(60); fireTimer=0; }

    fires.forEach(f=>{
        f.x += f.dx; f.y += f.dy;
        if(f.x<f.size || f.x>canvas.width-f.size) f.dx*=-1;
        if(f.y<f.size || f.y>canvas.height-f.size) f.dy*=-1;
    });

    checkCollisions();
}

function checkCollisions(){
    bullets.forEach((b,bi)=>{
        fires.forEach((f,fi)=>{
            let dx=b.x-f.x;
            let dy=b.y-f.y;
            if(Math.sqrt(dx*dx+dy*dy)<f.size){
                score+=10;
                bullets.splice(bi,1);
                if(f.size>30){
                    for(let i=0;i<2;i++){
                        fires.push({
                            x:f.x,
                            y:f.y,
                            size:f.size/2,
                            dx:(Math.random()-0.5)*3,
                            dy:(Math.random()-0.5)*3
                        });
                    }
                }
                fires.splice(fi,1);
            }
        });
    });

    fires.forEach(f=>{
        let dx=ship.x-f.x;
        let dy=ship.y-f.y;
        if(Math.sqrt(dx*dx+dy*dy)<f.size){
            gameOver=true;
            if(score>highScore) highScore=score;
        }
    });
}

/* Drawing */
function drawBackground(){ ctx.fillStyle="#4CAF50"; ctx.fillRect(0,0,canvas.width,canvas.height); }

function drawShip(){
    const scale = Math.min(canvas.width, canvas.height)/8;
    ctx.drawImage(shipImg, ship.x - scale/2, ship.y - scale/2, scale, scale);
}

function draw(){
    drawBackground();
    drawShip();

    bullets.forEach(b=>{
        const bulletSize = Math.min(canvas.width, canvas.height)/25;
        ctx.fillStyle="#00BFFF";
        ctx.fillRect(b.x - bulletSize/2, b.y - bulletSize/2, bulletSize, bulletSize*3);
    });

    fires.forEach(f=>{
        const fireSize = f.size * Math.min(canvas.width, canvas.height)/800;
        ctx.drawImage(fireImg, f.x - fireSize, f.y - fireSize, fireSize*2, fireSize*2);
    });

    ctx.fillStyle="white";
    ctx.font="22px monospace";
    ctx.fillText("Score: "+score,20,40);
    ctx.fillText("Highscore: "+highScore,20,70);

    if(gameOver){
        ctx.font="60px monospace";
        ctx.fillText("GAME OVER",canvas.width/2-200,canvas.height/2);
        ctx.font="28px monospace";
        ctx.fillText("Press SPACE or tap screen to restart",canvas.width/2-180,canvas.height/2+50);
    }
}

/* Reset */
function resetGame(){
    ship.x=canvas.width/2; ship.y=canvas.height/2;
    bullets=[]; fires=[]; score=0; gameOver=false;
    for(let i=0;i<3;i++) spawnFire();
}

/* Mobile Controls */
function pressKey(key){ keys[key]=true; }
function releaseKey(key){ keys[key]=false; }
function bind(btn,key){
    btn.addEventListener("touchstart",()=>pressKey(key));
    btn.addEventListener("touchend",()=>releaseKey(key));
}
bind(document.getElementById("up"),"ArrowUp");
bind(document.getElementById("down"),"ArrowDown");
bind(document.getElementById("left"),"ArrowLeft");
bind(document.getElementById("right"),"ArrowRight");
bind(document.getElementById("shoot")," ");

/* Mobile tap restart */
canvas.addEventListener("touchstart", () => {
    if(gameOver){
        resetGame();
    }
});

/* Game Loop */
function gameLoop(){ update(); draw(); requestAnimationFrame(gameLoop); }
gameLoop();
