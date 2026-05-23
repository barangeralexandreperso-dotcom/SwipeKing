// =========================
// VARIABLES PRINCIPALES
// =========================
let distance=0;
let lastY=0;
let lastX=0;
let holding=false;
let gameOver=false;
let swipeMode="vertical";
let nextSwitch=250;
let lastMode="vertical";
let transitionPause=false;
let playerName="Anonyme";
let enemyForce=0.1;
let timeLeft = 10;
let lastFrame = performance.now();
let bonusCount = 0;
let gameStarted = false;
let gameRunning = false;

// gain joueur
// très rapide
//let gainMultiplier=0.08;

// équilibré arcade
//let gainMultiplier=0.04;

// réaliste "cm"
//let gainMultiplier=0.025;

// très difficile
let gainMultiplier=0.015;

// =========================
// ELEMENTS DOM
// =========================
const d=document.getElementById("distance");
const arena=document.getElementById("arena");
const rope=document.getElementById("rope");

// bloque scroll mobile
document.body.style.touchAction="none";
// =========================
// AUDIO
// =========================
const audio=new (window.AudioContext||window.webkitAudioContext)();
function beep(f){
let o=audio.createOscillator();
let g=audio.createGain();
o.connect(g);
g.connect(audio.destination);
o.frequency.value=f;
g.gain.value=.03;
o.start();
o.stop(audio.currentTime+.04);
}

// =========================
// VISITES
// =========================
setTimeout(async () => 
{if (typeof incrementVisits !== "function") {console.error("incrementVisits pas chargé");return;}
  const c = await incrementVisits();document.getElementById("counter").textContent = "👁 " + c;
}, 500);

// =========================
// CALCUL DIFFICULTE
// =========================
function getStepSize(){if(distance<1500){return 250;}if(distance<2500){return 200;}
if(distance<4000){return 150;}
if(distance<6000){return 120;}
return 100;
}

// =========================
// CHANGEMENT MODE
// =========================
function updateMode(){
if(distance >= nextSwitch){swipeMode = swipeMode==="vertical"?"horizontal":"vertical";
transitionPause = true;
if(swipeMode==="horizontal"){arena.classList.add("horizontal");}
else{arena.classList.remove("horizontal");}

// =========================
// BONUS TEMPS
// =========================
bonusCount++;
if(bonusCount === 1){timeLeft += 5;showTimeBonus(5);}
else if(bonusCount % 3 === 0){timeLeft += 3;showTimeBonus(3);}
if(distance > 4000 && bonusCount % 5 === 0){timeLeft += 2;showTimeBonus(2);}
nextSwitch += getStepSize();
lastMode = swipeMode;
setTimeout(()=>{transitionPause=false;},500);}}

// =========================
// SWIPE
// =========================
function swipe(e){
if(!gameStarted) return;
if(!holding || gameOver || transitionPause)return;
let currentY=e.clientY;
let currentX=e.clientX;
let deltaY=currentY-lastY;
let deltaX=currentX-lastX;
let absY=Math.abs(deltaY);
let absX=Math.abs(deltaX);

// =========================
// MODE VERTICAL
// =========================
if(swipeMode==="vertical"){
if(absY>absX && absY>2){distance += absY*(gainMultiplier*2);beep(260);}}

// =========================
// MODE HORIZONTAL
// =========================
else{if(absX>absY && absX>2){distance += absX*(gainMultiplier*2);beep(300);}}
lastY=currentY;
lastX=currentX;
}
function showTimeBonus(amount){const el = document.getElementById("timeBonus");
el.textContent = "+" + amount + "s";
el.style.color = `hsl(${Math.random()*360},100%,70%)`;
el.classList.remove("show");
void el.offsetWidth;
el.classList.add("show");
if(navigator.vibrate){navigator.vibrate(60);}
beep(600);
setTimeout(()=>{el.classList.remove("show");},500);}

// =========================
// UPDATE PRINCIPAL
// =========================
function update()
{
if(!gameStarted) return;
const now = performance.now();
const delta = (now - lastFrame) / 1000;
lastFrame = now;
timeLeft -= delta;
if(timeLeft <= 0){timeLeft = 0;endGame();}
d.textContent=Math.floor(distance)+" cm";
const timerEl = document.getElementById("timer");
timerEl.textContent = timeLeft.toFixed(1)+" s";
if(timeLeft < 3){timerEl.style.color = "red";
timerEl.style.transform = `scale(${1 + Math.sin(Date.now()/80)*0.15})`;}
else{timerEl.style.color = "#ffdd88";timerEl.style.transform = "scale(1)";}
updateMode();
distance -= enemyForce;
if(distance<0){distance=0;}
enemyForce=Math.min(0.25,0.04+distance/30000);
rope.style.transform=`translateY(${Math.sin(distance/15)*3}px)`;
document.body.style.background=`hsl(${distance%360},30%,5%)`;
}

// =========================
// BOUCLE
// =========================
function loop(){
if(gameOver) return;
if(!gameStarted){requestAnimationFrame(loop);return;}
update();
requestAnimationFrame(loop);
}
function startGame()
{
gameStarted = true;
gameRunning = true;
lastFrame = performance.now();
}
// =========================
// GAME OVER
// =========================
async function endGame(){if(gameOver)return;
gameOver=true;
let score=Math.floor(distance);
let name=prompt("Ton pseudo ?");
if(!name || name.trim()===""){name="Anonyme";}
await saveScore(name,score);
let leaderboard=await getScores();
document.getElementById("end").style.display="flex";
document.getElementById("end").innerHTML=`
<div>GAME OVER</div>
<div style="font-size:2em">${score} cm</div>
<div>${leaderboard}</div>
<button onclick="location.reload()">Retry</button>`;
if(navigator.vibrate){navigator.vibrate([200,100,200]);
}
beep(180);
}

// =========================
// EVENTS SOURIS
// =========================

window.addEventListener("mousedown",e=>{
holding=true;
lastY=e.clientY;
lastX=e.clientX;
});

window.addEventListener("mousemove",swipe);

window.addEventListener("mouseup",()=>{
holding=false;
});
// =========================
// EVENTS MOBILE
// =========================

window.addEventListener("touchstart",e=>{
holding=true;
lastY=e.touches[0].clientY;
lastX=e.touches[0].clientX;
},{passive:false});

window.addEventListener("touchmove",e=>{
e.preventDefault();
swipe(e.touches[0]);
},{passive:false});

window.addEventListener("touchend",()=>{
holding=false;
},{passive:false});

loop();
