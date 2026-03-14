const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

/* CANVAS */

function resizeCanvas(){

canvas.width = window.innerWidth
canvas.height = window.innerHeight

}

resizeCanvas()

window.addEventListener("resize",resizeCanvas)

/* STOP PHONE ZOOM */

document.addEventListener("dblclick",e=>e.preventDefault())

document.addEventListener("touchmove",e=>{
if(e.scale !== 1) e.preventDefault()
},{passive:false})

/* CONSTANTS */

const BORDER = 20

/* GAME STATE */

let ship = {x:0,y:0,speed:6}

let bullets=[]
let fires=[]

let shootDir={x:0,y:-1}

let score=0
let highScore=0

let gameOver=false
let started=false

let keys={}

/* IMAGES */

const fireImg = new Image()
fireImg.src="images/asteroid.png"

const shipImg = new Image()
shipImg.src="images/ship.png"

/* START */

const startScreen=document.getElementById("startScreen")

startScreen.addEventListener("click",()=>{
startScreen.style.display="none"
started=true
resetGame()
})

/* CONTROLS */

document.addEventListener("keydown",e=>keys[e.key]=true)
document.addEventListener("keyup",e=>keys[e.key]=false)

function bind(btn,key){

btn.addEventListener("touchstart",()=>keys[key]=true)
btn.addEventListener("touchend",()=>keys[key]=false)

btn.addEventListener("mousedown",()=>keys[key]=true)
btn.addEventListener("mouseup",()=>keys[key]=false)

}

bind(up,"ArrowUp")
bind(down,"ArrowDown")
bind(left,"ArrowLeft")
bind(right,"ArrowRight")
bind(shoot," ")

/* SPAWN FIRE */

function spawnFire(size=50){

let x,y

do{

x = BORDER + Math.random()*(canvas.width-BORDER*2)
y = BORDER + Math.random()*(canvas.height-BORDER*2)

}while(Math.hypot(x-ship.x,y-ship.y) < 150)

fires.push({

x:x,
y:y,

dx:(Math.random()-0.5)*2,
dy:(Math.random()-0.5)*2,

size:size

})

}

/* RESET */

function resetGame(){

ship.x = canvas.width/2
ship.y = canvas.height/2

bullets=[]
fires=[]

score=0
gameOver=false

for(let i=0;i<3;i++) spawnFire()

}

/* UPDATE */

let fireTimer=0

function update(){

if(!started || gameOver) return

/* movement */

if(keys["ArrowLeft"]){ship.x-=ship.speed;shootDir={x:-1,y:0}}
if(keys["ArrowRight"]){ship.x+=ship.speed;shootDir={x:1,y:0}}
if(keys["ArrowUp"]){ship.y-=ship.speed;shootDir={x:0,y:-1}}
if(keys["ArrowDown"]){ship.y+=ship.speed;shootDir={x:0,y:1}}

const shipSize = Math.min(canvas.width,canvas.height)/5

ship.x = Math.max(BORDER+shipSize/2,
Math.min(canvas.width-BORDER-shipSize/2,ship.x))

ship.y = Math.max(BORDER+shipSize/2,
Math.min(canvas.height-BORDER-shipSize/2,ship.y))

/* shooting */

if(keys[" "]){
bullets.push({
x:ship.x,
y:ship.y,
dx:shootDir.x*12,
dy:shootDir.y*12
})
keys[" "]=false
}

/* bullets */

bullets.forEach(b=>{
b.x+=b.dx
b.y+=b.dy
})

/* spawn fires */

fireTimer++

if(fireTimer>120){
spawnFire()
fireTimer=0
}

/* fire movement */

fires.forEach(f=>{

f.x += f.dx
f.y += f.dy

if(f.x - f.size < BORDER){
f.x = BORDER + f.size
f.dx = Math.abs(f.dx)
}

if(f.x + f.size > canvas.width - BORDER){
f.x = canvas.width - BORDER - f.size
f.dx = -Math.abs(f.dx)
}

if(f.y - f.size < BORDER){
f.y = BORDER + f.size
f.dy = Math.abs(f.dy)
}

if(f.y + f.size > canvas.height - BORDER){
f.y = canvas.height - BORDER - f.size
f.dy = -Math.abs(f.dy)
}

})

checkCollisions()

}

/* COLLISIONS */

function checkCollisions(){

bullets.forEach((b,bi)=>{

fires.forEach((f,fi)=>{

if(Math.hypot(b.x-f.x,b.y-f.y)<f.size){

score+=10

bullets.splice(bi,1)

if(f.size>28){

for(let i=0;i<2;i++){

fires.push({
x:f.x,
y:f.y,
dx:(Math.random()-0.5)*3,
dy:(Math.random()-0.5)*3,
size:f.size/2
})

}

}

fires.splice(fi,1)

}

})

})

fires.forEach(f=>{
if(Math.hypot(ship.x-f.x,ship.y-f.y)<f.size){

gameOver=true

if(score>highScore) highScore=score

}
})

}

/* DRAW BACKGROUND */

function drawBackground(){

ctx.fillStyle="#2E7D32"
ctx.fillRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="#4CAF50"

ctx.fillRect(
BORDER,
BORDER,
canvas.width-BORDER*2,
canvas.height-BORDER*2
)

}

/* DRAW */

function draw(){

drawBackground()

const shipSize=Math.min(canvas.width,canvas.height)/5

ctx.drawImage(
shipImg,
ship.x-shipSize/2,
ship.y-shipSize/2,
shipSize,
shipSize
)

/* water bullets */

bullets.forEach(b=>{
ctx.fillStyle="#00BFFF"
ctx.fillRect(b.x-6,b.y-10,12,20)
})

/* fires */

fires.forEach(f=>{
ctx.drawImage(
fireImg,
f.x-f.size,
f.y-f.size,
f.size*2,
f.size*2
)
})

ctx.fillStyle="white"
ctx.font="20px monospace"

ctx.fillText("Score: "+score,20,35)
ctx.fillText("Highscore: "+highScore,20,60)

if(gameOver){

ctx.font="40px monospace"
ctx.fillText("GAME OVER",canvas.width/2-120,canvas.height/2)

ctx.font="20px monospace"
ctx.fillText("Tap to restart",canvas.width/2-80,canvas.height/2+40)

}

}

/* LOOP */

function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()

canvas.addEventListener("click",()=>{
if(gameOver) resetGame()
})
