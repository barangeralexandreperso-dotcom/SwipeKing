// =========================
// VARIABLES PRINCIPALES
// =========================

let distance=0;
let lastY=0;
let lastX=0;

let holding=false;
let gameOver=false;

// mode actuel : vertical ou horizontal
let swipeMode="vertical";

// changement de direction tous les X points
let modeStep=50;

// premier changement après 25
let firstSwitch=25;

// pause pendant changement de mode
let transitionPause=false;

// dernier mode connu
let lastMode="vertical";

// pseudo joueur
let playerName="Anonyme";

// force de l'ennemi
let enemyForce=0.04;

// multiplicateur de gain
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

// empêche le scroll tactile mobile
document.body.style.touchAction="none";

// =========================
// PETIT BIP AUDIO
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
// COMPTEUR DE VISITES
// =========================

window.addEventListener("load",()=>{

incrementVisits().then(c=>{

document.getElementById("counter").textContent="👁 "+c;

});
});

// =========================
// GESTION CHANGEMENT MODE
// =========================

function updateMode(){

let level=Math.floor(distance/modeStep);

// début toujours vertical
if(distance<firstSwitch){

swipeMode="vertical";

arena.classList.remove("horizontal");

return;
}

// alterne vertical/horizontal
let newMode=level%2===0?"vertical":"horizontal";

// si changement
if(newMode!==lastMode){

transitionPause=true;

swipeMode=newMode;

// classe CSS
if(swipeMode==="vertical"){

arena.classList.remove("horizontal");
}
else{

arena.classList.add("horizontal");
}

lastMode=newMode;

// petite pause pour laisser le temps au joueur
setTimeout(()=>{

transitionPause=false;

},400);
}
}

// =========================
// DETECTION SWIPE
// =========================

function swipe(e){

if(!holding || gameOver || transitionPause)return;

// position actuelle
let currentY=e.clientY;
let currentX=e.clientX;

// différence depuis dernière frame
let deltaV=Math.abs(currentY-lastY);
let deltaH=Math.abs(currentX-lastX);

// =========================
// MODE VERTICAL
// =========================

if(swipeMode==="vertical"){

if(deltaV>2){

// ajoute dans les 2 sens
distance += deltaV*(gainMultiplier*2);

beep(260);
}
}

// =========================
// MODE HORIZONTAL
// =========================

else{

if(deltaH>2){

// ajoute dans les 2 sens
distance += deltaH*(gainMultiplier*2);

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

// affichage score
d.textContent=Math.floor(distance)+" cm";

// gestion mode
updateMode();

// force ennemie
distance -= enemyForce;

// empêche score négatif
if(distance<0){

distance=0;
}

// difficulté progressive
enemyForce=Math.min(0.25,0.04+distance/30000);

// animation corde
rope.style.transform=
`translateY(${Math.sin(distance/15)*3}px)`;

// fond dynamique
document.body.style.background=
`hsl(${distance%360},30%,5%)`;
}

// =========================
// BOUCLE PRINCIPALE
// =========================

function loop(){

if(gameOver)return;

update();

requestAnimationFrame(loop);
}

// =========================
// FIN DE PARTIE
// =========================

async function endGame(){

if(gameOver)return;

gameOver=true;

let score=Math.floor(distance);

// demande pseudo
let name=prompt("Ton pseudo ?");

if(!name || name.trim()===""){

name="Anonyme";
}

// sauvegarde score
await saveScore(name,score);

// récup leaderboard
let leaderboard=await getScores();

// affiche écran fin
document.getElementById("end").style.display="flex";

document.getElementById("end").innerHTML=`
<div>GAME OVER</div>
<div style="font-size:2em">${score} cm</div>
<div>${leaderboard}</div>
<button onclick="location.reload()">Retry</button>`;

// vibration mobile
if(navigator.vibrate){

navigator.vibrate([200,100,200]);
}

// son game over
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
// EVENTS TACTILES MOBILE
// =========================

window.addEventListener("touchstart",e=>{

holding=true;

lastY=e.touches[0].clientY;

lastX=e.touches[0].clientX;

},{passive:false});

window.addEventListener("touchmove",e=>{

// empêche scroll mobile
e.preventDefault();

swipe(e.touches[0]);

},{passive:false});

window.addEventListener("touchend",()=>{

holding=false;

endGame();
});

// =========================
// DEMARRAGE JEU
// =========================

loop();