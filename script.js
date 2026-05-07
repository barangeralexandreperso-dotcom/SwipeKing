let distance=0;
let lastY=0;
let lastX=0;
let holding=false;
let gameOver=false;

let swipeMode="vertical";
let modeStep=50;
let firstSwitch=25;

let playerName="Anonyme";

let enemyForce=0.08;
let gainMultiplier=0.12;

const d=document.getElementById("distance");
const arena=document.getElementById("arena");
const rope=document.getElementById("rope");

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

window.addEventListener("load",()=>{
  incrementVisits().then(c=>{
    document.getElementById("counter").textContent="👁 "+c;
  });
});

function updateMode(){

  let level=Math.floor(distance/modeStep);

  if(distance<firstSwitch){
    swipeMode="vertical";
    arena.classList.remove("horizontal");
    return;
  }

  if(level%2===0){
    swipeMode="vertical";
    arena.classList.remove("horizontal");
  }else{
    swipeMode="horizontal";
    arena.classList.add("horizontal");
  }
}

function swipe(e){

  if(!holding||gameOver)return;

  let deltaV=e.clientY-lastY;
  let deltaH=e.clientX-lastX;

  if(swipeMode==="vertical"){

    if(Math.abs(deltaV)>6){
      distance += deltaV * gainMultiplier;
      beep(260);
    }

  }else{

    if(Math.abs(deltaH)>6){
      distance += deltaH * gainMultiplier;
      beep(300);
    }

  }

  lastY=e.clientY;
  lastX=e.clientX;
}

function update(){

  d.textContent=Math.floor(distance)+" cm";

  updateMode();

  distance -= enemyForce;

  if(distance < 0) distance = 0;

  enemyForce = Math.min(
    0.25,
    0.08 + distance/30000
  );

  rope.style.transform=
    `translateY(${Math.sin(distance/15)*3}px)`;

  document.body.style.background=
    `hsl(${distance%360},30%,5%)`;
}

function loop(){

  if(gameOver)return;

  update();

  requestAnimationFrame(loop);
}

async function endGame(){

  if(gameOver)return;

  gameOver=true;

  let score=Math.floor(distance);

  let name = prompt("Ton pseudo ?");

  if(!name || name.trim()===""){
    name="Anonyme";
  }

  await saveScore(name,score);

  let leaderboard=await getScores();

  document.getElementById("end").style.display="flex";

  document.getElementById("end").innerHTML=`
    <div>GAME OVER</div>
    <div style="font-size:2em">${score} cm</div>
    <div>${leaderboard}</div>
    <button onclick="location.reload()">Retry</button>
  `;

  if(navigator.vibrate){
    navigator.vibrate([200,100,200]);
  }

  beep(180);
}

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

window.addEventListener("touchstart",e=>{
  holding=true;
  lastY=e.touches[0].clientY;
  lastX=e.touches[0].clientX;
},{passive:false});

window.addEventListener("touchmove",e=>{
  swipe(e.touches[0]);
},{passive:false});

window.addEventListener("touchend",()=>{
  holding=false;
  endGame();
});

loop();