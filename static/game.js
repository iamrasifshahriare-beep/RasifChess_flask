
// static/game.js

const canvas = document.getElementById("chessCanvas");
const ctx = canvas.getContext("2d");

const boardSize = 8;
const tileSize= canvas.width/boardSize;

const lightColor = "white";
const darkColor = "#2e8b57";

let pieces = [
["♜","♞","♝","♛","♚","♝","♞","♜"],
["♟","♟","♟","♟","♟","♟","♟","♟"],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["♙","♙","♙","♙","♙","♙","♙","♙"],
["♖","♘","♗","♕","♔","♗","♘","♖"]
];

let selected=null;
let turn="white";

let kingMoved={white:false,black:false};
let rookMoved={white:{h:false,a:false},black:{h:false,a:false}};

let whiteTime=600;
let blackTime=600;
let timerInterval=null;



function updateTimerDisplay(){

let wMin=Math.floor(whiteTime/60);
let wSec=whiteTime%60;

let bMin=Math.floor(blackTime/60);
let bSec=blackTime%60;

document.getElementById("whiteTimer").innerText=
"White: "+wMin+":"+(wSec<10?"0":"")+wSec;

document.getElementById("blackTimer").innerText=
"Black: "+bMin+":"+(bSec<10?"0":"")+bSec;

if(turn==="white"){
document.getElementById("whiteTimer").style.color="red";
document.getElementById("blackTimer").style.color="black";
}else{
document.getElementById("blackTimer").style.color="red";
document.getElementById("whiteTimer").style.color="black";
}
}



function startTimer(){

timerInterval=setInterval(()=>{

if(turn==="white") whiteTime--;
else blackTime--;

updateTimerDisplay();

if(whiteTime<=0){
alert("Black wins on time!");
clearInterval(timerInterval);
}

if(blackTime<=0){
alert("White wins on time!");
clearInterval(timerInterval);
}

},1000);

}



function getColor(piece){
if(piece==="") return null;

const code=piece.charCodeAt(0);

if(code>=9812 && code<=9817) return "white";
if(code>=9818 && code<=9823) return "black";

return null;
}



function drawBoard(){

for(let r=0;r<8;r++){

for(let c=0;c<8;c++){

ctx.fillStyle=(r+c)%2===0?lightColor:darkColor;
ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);

if(selected && selected.row===r && selected.col===c){
ctx.fillStyle="rgba(255,255,0,0.5)";
ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
}

if(pieces[r][c]!==""){
ctx.fillStyle="black";
ctx.font=`${tileSize-10}px Arial`;
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillText(pieces[r][c],c*tileSize+tileSize/2,r*tileSize+tileSize/2);
}

}

}

}



function pathClear(fr,fc,tr,tc){

let dr=Math.sign(tr-fr);
let dc=Math.sign(tc-fc);

let r=fr+dr;
let c=fc+dc;

while(r!==tr || c!==tc){

if(pieces[r][c]!=="") return false;

r+=dr;
c+=dc;

}

return true;

}



function isLegalMove(fr,fc,tr,tc){

let piece=pieces[fr][fc];

if(!piece) return false;
if(getColor(piece)!==turn) return false;

let target=pieces[tr][tc];
if(getColor(target)===turn) return false;

let dr=tr-fr;
let dc=tc-fc;

let legal=false;

switch(piece){

case "♙":
legal=(dc===0 && dr===-1 && target==="") ||
(dc===0 && dr===-2 && fr===6 && pieces[fr-1][fc]==="") ||
(Math.abs(dc)===1 && dr===-1 && target!=="");
break;

case "♟":
legal=(dc===0 && dr===1 && target==="") ||
(dc===0 && dr===2 && fr===1 && pieces[fr+1][fc]==="") ||
(Math.abs(dc)===1 && dr===1 && target!=="");
break;

case "♖": case "♜":
legal=(dr===0||dc===0)&&pathClear(fr,fc,tr,tc);
break;

case "♗": case "♝":
legal=(Math.abs(dr)===Math.abs(dc))&&pathClear(fr,fc,tr,tc);
break;

case "♕": case "♛":
legal=(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))&&pathClear(fr,fc,tr,tc);
break;

case "♔": case "♚":
legal=(Math.abs(dr)<=1 && Math.abs(dc)<=1);
break;

case "♘": case "♞":
legal=(Math.abs(dr)===2 && Math.abs(dc)===1) || (Math.abs(dr)===1 && Math.abs(dc)===2);
break;

}

return legal;

}



canvas.addEventListener("click",e=>{

const rect=canvas.getBoundingClientRect();

const col=Math.floor((e.clientX-rect.left)/tileSize);
const row=Math.floor((e.clientY-rect.top)/tileSize);

if(selected){

if(isLegalMove(selected.row,selected.col,row,col)){

let piece=pieces[selected.row][selected.col];

pieces[row][col]=piece;
pieces[selected.row][selected.col]="";

if(piece==="♙" && row===0) pieces[row][col]="♕";
if(piece==="♟" && row===7) pieces[row][col]="♛";

selected=null;

turn = turn==="white" ? "black" : "white";

updateTimerDisplay();

}else{
selected=null;
}

}else{

if(pieces[row][col]!==""){

let color=getColor(pieces[row][col]);

if(color===turn){
selected={row:row,col:col};
}

}

}

drawBoard();

});



updateTimerDisplay();
startTimer();
drawBoard();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/static/sw.js")
    .then(() => console.log("Service Worker Registered"));
}




