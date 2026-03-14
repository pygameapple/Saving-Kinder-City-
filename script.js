const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ---------- PHONE-FIRST CANVAS ---------- */

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ---------- STOP PHONE ZOOM ---------- */

document.addEventListener("touchmove", e=>{
    if(e.scale !== 1) e.preventDefault();
},{passive:false});

let lastTouch = 0;
document.addEventListener("touchstart", e=>{
    const now = Date.now();
    if(now-lastTouch < 300) e.preventDefault();
    lastTouch = now;
},{passive:false});

/* ---------- GAME CONSTANTS ---------- */

const BORDER = 20; // thinner border

/* ---------- GAME STATE ---------- */

let ship = {x:0,y:0,speed:6};
let shootDir = {x:0,y:-1};

let bullets = [];
let fires = [];
let keys = {};

let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;

/* ---------- IMAGES ---------- */

const fireImg = new Image();
fireImg.src = "images/asteroid.png";

const shipImg = new Image();
shipImg.src = "images/ship.png";

/* ---------- START SCREEN ---------- */

const startScreen = document.getElementById("startScreen");

function startGame(){
    startScreen.style.display="none";
    resetGame();
    gameStarted=true;
}

startScreen.addEventListener("touchstart",startGame);
startScreen.addEventListener("mousedown",startGame);

/* ---------- SPAWN FIRE ---------- */

function spawnFire(size=65){

    let x,y;
    const safe = 150;

    do{

        x = BORDER + Math.random()*(canvas.width-BORDER*2);
        y = BORDER + Math.random()*(canvas.height-BORDER*2);

    }
    while(Math.hypot(x-ship.x,y-ship.y) < safe);

    fires.push({
        x,y,
        size,
        dx:(Math.random()-0.5)*2,
        dy:(Math.random()-0.5)*2
    });
}

/* ---------- RESET ---------- */

function resetGame(){

    ship.x = canvas.width/2;
    ship.y = canvas.height/2;

    bullets=[];
    fires=[];
    score=0;
    gameOver=false;

    for(let i=0;i<3;i++) spawnFire();
}

/* ---------- CONTROLS ---------- */

document.addEventListener("keydown",e=>{
    keys[e.key]=true;
});

document.addEventListener("keyup",e=>{
    keys[e.key]=false;
});

function press(k){ keys[k]=true; }
function release(k){ keys[k]=false; }

function bind(btn,key){
    btn.addEventListener("touchstart",()=>press(key));
    btn.addEventListener("touchend",()=>release(key));
}

bind(document.getElementById("up"),"ArrowUp");
bind(document.getElementById("down"),"ArrowDown");
bind(document.getElementById("left"),"ArrowLeft");
bind(document.getElementById("right"),"ArrowRight");
bind(document.getElementById("shoot")," ");

/* ---------- RESTART ---------- */

canvas.addEventListener("touchstart",()=>{
    if(gameOver) resetGame();
});
canvas.addEventListener("mousedown",()=>{
    if(gameOver) resetGame();
});

/* ---------- UPDATE ---------- */

let fireTimer = 0;

function update(){

    if(!gameStarted || gameOver) return;

    const shipSize = Math.min(canvas.width,canvas.height)/7;

    if(keys["ArrowLeft"]){ship.x-=ship.speed;shootDir={x:-1,y:0};}
    if(keys["ArrowRight"]){ship.x+=ship.speed;shootDir={x:1,y:0};}
    if(keys["ArrowUp"]){ship.y-=ship.speed;shootDir={x:0,y:-1};}
    if(keys["ArrowDown"]){ship.y+=ship.speed;shootDir={x:0,y:1};}

    /* keep ship inside field */

    ship.x = Math.max(
        BORDER+shipSize/2,
        Math.min(canvas.width-BORDER-shipSize/2,ship.x)
    );

    ship.y = Math.max(
        BORDER+shipSize/2,
        Math.min(canvas.height-BORDER-shipSize/2,ship.y)
    );

    /* shoot */

    if(keys[" "]){
        bullets.push({
            x:ship.x,
            y:ship.y,
            dx:shootDir.x*14,
            dy:shootDir.y*14
        });
        keys[" "]=false;
    }

    bullets.forEach(b=>{
        b.x+=b.dx;
        b.y+=b.dy;
    });

    /* spawn fires */

    fireTimer++;

    if(fireTimer>100){
        spawnFire();
        fireTimer=0;
    }

    /* move fires */

    fires.forEach(f=>{

        f.x+=f.dx;
        f.y+=f.dy;

        if(f.x < BORDER+f.size || f.x > canvas.width-BORDER-f.size) f.dx*=-1;
        if(f.y < BORDER+f.size || f.y > canvas.height-BORDER-f.size) f.dy*=-1;

    });

    checkCollisions();
}

/* ---------- COLLISIONS ---------- */

function checkCollisions(){

    bullets.forEach((b,bi)=>{

        fires.forEach((f,fi)=>{

            if(Math.hypot(b.x-f.x,b.y-f.y)<f.size){

                score+=10;
                bullets.splice(bi,1);

                if(f.size>35){

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
        if(Math.hypot(ship.x-f.x,ship.y-f.y)<f.size){
            gameOver=true;
            if(score>highScore) highScore=score;
        }
    });

}

/* ---------- DRAW BACKGROUND ---------- */

function drawBackground(){

    ctx.fillStyle="#2E7D32";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#4CAF50";
    ctx.fillRect(
        BORDER,
        BORDER,
        canvas.width-BORDER*2,
        canvas.height-BORDER*2
    );

}

/* ---------- DRAW ---------- */

function draw(){

    drawBackground();

    const shipSize=Math.min(canvas.width,canvas.height)/7;

    ctx.drawImage(
        shipImg,
        ship.x-shipSize/2,
        ship.y-shipSize/2,
        shipSize,
        shipSize
    );

    bullets.forEach(b=>{
        ctx.fillStyle="#00BFFF";
        ctx.fillRect(b.x-5,b.y-10,10,20);
    });

    fires.forEach(f=>{
        ctx.drawImage(
            fireImg,
            f.x-f.size,
            f.y-f.size,
            f.size*2,
            f.size*2
        );
    });

    ctx.fillStyle="white";
    ctx.font="20px monospace";
    ctx.fillText("Score: "+score,20,35);
    ctx.fillText("Highscore: "+highScore,20,60);

    if(gameOver){

        ctx.font="42px monospace";
        ctx.fillText(
            "GAME OVER",
            canvas.width/2-120,
            canvas.height/2
        );

        ctx.font="20px monospace";
        ctx.fillText(
            "Tap or click to restart",
            canvas.width/2-110,
            canvas.height/2+35
        );

    }

}

/* ---------- GAME LOOP ---------- */

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
