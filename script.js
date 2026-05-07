// =========================
// VARIABLES PRINCIPALES
// =========================

let distance=0;

let lastY=0;
let lastX=0;

let holding=false;
let gameOver=false;

// mode actuel
let swipeMode="vertical";

// prochain seuil de changement
let nextSwitch=250;

// historique mode
let lastMode="vertical";

// pause pendant transition
let transitionPause=false;

// pseudo joueur
let playerName="Anonyme";

// force ennemie
let enemyForce=0.04;

// gain joueur
let gainMultiplier=0.12;

// =========================
// ELEMENTS DOM
// =========================

const d=document.getElementById("distance");

const arena=document.getElementById("arena");

const rope=document.getElementById("rope");

// =========================
// AUDIO
// =========================

const audio=
new (window.AudioContext||window.webkitAudioContext)();

// bloque scroll mobile
document.body.style.touchAction="none";

// =========================
// PETIT SON
// =========================

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

window.addEventListener("load",()=>{

incrementVisits().then(c=>{

document.getElementById("counter").textContent="👁 "+c;

});
});

// =========================
// CALCUL DIFFICULTE
// =========================

function getStepSize(){

// progression exponentielle

if(distance<1500){

return 250;
}

if(distance<2500){

return 200;
}

if(distance<4000){

return 150;
}

if(distance<6000){

return 120;
}

return 100;
}

// =========================
// CHANGEMENT MODE
// =========================

function updateMode(){

// si on dépasse le prochain seuil
if(distance>=nextSwitch){

// inverse mode
swipeMode=
swipeMode==="vertical"
?"horizontal"
:"vertical";

// transition
transitionPause=true;

// css
if(swipeMode==="horizontal"){

arena.classList.add("horizontal");
}
else{

arena.classList.remove("horizontal");
}

// nouveau seuil dynamique
nextSwitch += getStepSize();

// mémorise mode
lastMode=swipeMode;

// temps pour réagir
setTimeout(()=>{

transitionPause=false;

},500);
}
}

// =========================
// SWIPE
// =========================

function swipe(e){

if(!holding || gameOver || transitionPause)return;

// position actuelle
let currentY=e.clientY;

let currentX=e.clientX;

// delta réel
let deltaY=currentY-lastY;

let deltaX=currentX-lastX;

// valeurs absolues
let absY=Math.abs(deltaY);

let absX=Math.abs(deltaX);

// =========================
// MODE VERTICAL
// =========================

if(swipeMode==="vertical"){

// ignore si horizontal dominant
if(absY>absX && absY>2){

distance += absY*(gainMultiplier*2);

beep(260);
}
}

// =========================
// MODE HORIZONTAL
// =========================

else{

// ignore si vertical dominant
if(absX>absY && absX>2){

distance += absX*(gainMultiplier*2);

beep(300);
}
}

// sauvegarde position
lastY=currentY;

lastX=currentX;
}

// =========================
// UPDATE PRINCIPAL
// =========================

function update(){

// score affiché
d.textContent=
Math.floor(distance)+" cm";

// update mode
updateMode();

// force ennemie
distance -= enemyForce;

// empêche négatif
if(distance<0){

distance=0;
}

// difficulté progressive
enemyForce=
Math.min(
0.25,
0.04+distance/30000
);

// animation corde
rope.style.transform=
`translateY(${Math.sin(distance/15)*3}px)`;

// fond dynamique
document.body.style.background=
`hsl(${distance%360},30%,5%)`;
}

// =========================
// BOUCLE
// =========================

function loop(){

if(gameOver)return;

update();

requestAnimationFrame(loop);
}

// =========================
// GAME OVER
// =========================

async function endGame(){

if(gameOver)return;

gameOver=true;

let score=Math.floor(distance);

// pseudo
let name=prompt("Ton pseudo ?");

if(!name || name.trim()===""){

name="Anonyme";
}

// sauvegarde
await saveScore(name,score);

// leaderboard
let leaderboard=
await getScores();

// affichage
document.getElementById("end").style.display="flex";

document.getElementById("end").innerHTML=`
<div>GAME OVER</div>
<div style="font-size:2em">${score} cm</div>
<div>${leaderboard}</div>
<button onclick="location.reload()">Retry</button>`;

// vibration
if(navigator.vibrate){

navigator.vibrate([200,100,200]);
}

// son fin
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

endGame();
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

endGame();
});

// =========================
// START
// =========================

loop();