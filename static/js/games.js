let kingMoved={white:false,black:false};
let rookMoved={white:{h:false,a:false},black:{h:false,a:false}};

let whiteTime=600;
let blackTime=600;
let timerInterval=null;
let enPassantTarget = null;

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

function getLegalMoves(row,col){

legalMoves = [];

for(let r=0;r<8;r++){
for(let c=0;c<8;c++){

if(isLegalMove(row,col,r,c)){
legalMoves.push({row:r,col:c});
}

}
}

}

canvas.addEventListener("click",e=>{

const rect=canvas.getBoundingClientRect();

const col=Math.floor((e.clientX-rect.left)/tileSize);
const row=Math.floor((e.clientY-rect.top)/tileSize);

if(selected){

if(isLegalMove(selected.row,selected.col,row,col)){

    // makeMove() handles: en passant capture removal,
    // castling rook movement, rook/king moved flags,
    // pawn promotion, and enPassantTarget tracking.
    makeMove(selected.row, selected.col, row, col);

    selected=null;
    legalMoves=[];

    turn = turn==="white" ? "black" : "white";

    updateTimerDisplay();
    drawBoard();

    if(isCheckmate(turn)){
        let winner = turn === "white" ? "Black" : "White";
        alert(winner + " wins by checkmate!");
        clearInterval(timerInterval);
    } else if(isKingInCheck(turn)){
        alert(turn.charAt(0).toUpperCase() + turn.slice(1) + " is in check!");
    }

}else{
    selected=null;
    drawBoard();
}

}else{

if(pieces[row][col]!==""){

let color=getColor(pieces[row][col]);

if(color===turn){
selected={row:row,col:col};
getLegalMoves(row,col);
}

}

drawBoard();

}

});

updateTimerDisplay();
startTimer();
drawBoard();

if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("/static/sw.js")
.then(() => console.log("Service Worker Registered"));
}