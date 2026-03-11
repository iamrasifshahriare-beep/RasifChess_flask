// static/game.js

const canvas = document.getElementById("chessCanvas");
const ctx = canvas.getContext("2d");

const boardSize = 8;
const tileSize = canvas.width / boardSize;
const lightColor = "white";
const darkColor = "#2e8b57";

let pieces = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"], // black
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"], // white
  ["♖","♘","♗","♕","♔","♗","♘","♖"]  // white
];

let selected = null;
let turn = "white";
let kingMoved = {white:false, black:false};
let rookMoved = {white:{h:false,a:false}, black:{h:false,a:false}};

// Detect piece color
function getColor(piece){
  if(piece==="") return null;
  const code = piece.charCodeAt(0);
  if(code>=9812 && code<=9817) return "white";
  if(code>=9818 && code<=9823) return "black";
  return null;
}

// Draw the board and pieces
function drawBoard(){
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      ctx.fillStyle = (r+c)%2===0 ? lightColor : darkColor;
      ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);

      if(selected && selected.row===r && selected.col===c){
        ctx.fillStyle = "rgba(255,255,0,0.5)";
        ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
      }

      if(pieces[r][c]!==""){
        ctx.fillStyle="black";
        ctx.font = `${tileSize-10}px Arial`;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(pieces[r][c], c*tileSize + tileSize/2, r*tileSize + tileSize/2);
      }
    }
  }
}

// Check path clear
function pathClear(fr,fc,tr,tc){
  let dr = Math.sign(tr-fr);
  let dc = Math.sign(tc-fc);
  let r = fr+dr, c=fc+dc;
  while(r!==tr || c!==tc){
    if(pieces[r][c]!=="") return false;
    r+=dr; c+=dc;
  }
  return true;
}

// Check if king is in check
function isInCheck(color){
  let kingPos;
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      if(pieces[r][c]===(color==="white"?"♔":"♚")) kingPos={row:r,col:c};
    }
  }
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      if(getColor(pieces[r][c])!==color && getColor(pieces[r][c])!==null){
        if(isLegalMove(r,c,kingPos.row,kingPos.col,false)) return true;
      }
    }
  }
  return false;
}

// Simulate move including castling/promotion to check for king safety
function wouldBeInCheck(fr,fc,tr,tc){
  // Make a deep copy
  let copy = pieces.map(r=>r.slice());
  let piece = copy[fr][fc];
  let color = getColor(piece);

  // Handle castling
  if(piece==="♔" && tc-fc===2){ copy[fr][fc+1]=copy[fr][7]; copy[fr][7]=""; }
  if(piece==="♔" && tc-fc===-2){ copy[fr][fc-1]=copy[fr][0]; copy[fr][0]=""; }
  if(piece==="♚" && tc-fc===2){ copy[fr][fc+1]=copy[fr][7]; copy[fr][7]=""; }
  if(piece==="♚" && tc-fc===-2){ copy[fr][fc-1]=copy[fr][0]; copy[fr][0]=""; }

  // Move piece
  copy[tr][tc]=piece;
  copy[fr][fc]="";

  // Handle pawn promotion in simulation
  if(piece==="♙" && tr===0) copy[tr][tc]="♕";
  if(piece==="♟" && tr===7) copy[tr][tc]="♛";

  // Check king position in simulated board
  let kingPos;
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      if(copy[r][c]===(color==="white"?"♔":"♚")) kingPos={row:r,col:c};
    }
  }
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      let p = copy[r][c];
      if(getColor(p)!==color && getColor(p)!==null){
        if(isLegalMoveSimulation(p, r,c, kingPos.row,kingPos.col, copy)) return true;
      }
    }
  }
  return false;
}

// Legal move check for simulation (ignores check)
function isLegalMoveSimulation(piece, fr, fc, tr, tc, board){
  let color = getColor(piece);
  let target = board[tr][tc];
  if(getColor(target)===color) return false;
  let dr = tr-fr, dc=tc-fc;
  switch(piece){
    case "♙":
      if(dc===0 && dr===-1 && target==="") return true;
      if(dc===0 && dr===-2 && fr===6 && board[fr-1][fc]==="") return true;
      if(Math.abs(dc)===1 && dr===-1 && target!=="") return true;
      return false;
    case "♟":
      if(dc===0 && dr===1 && target==="") return true;
      if(dc===0 && dr===2 && fr===1 && board[fr+1][fc]==="") return true;
      if(Math.abs(dc)===1 && dr===1 && target!=="") return true;
      return false;
    case "♖": case "♜": if(dr===0 || dc===0) return pathClearSimulation(fr,fc,tr,tc,board); return false;
    case "♗": case "♝": if(Math.abs(dr)===Math.abs(dc)) return pathClearSimulation(fr,fc,tr,tc,board); return false;
    case "♕": case "♛": if(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)) return pathClearSimulation(fr,fc,tr,tc,board); return false;
    case "♔": case "♚": if(Math.abs(dr)<=1 && Math.abs(dc)<=1) return true; return false;
    case "♘": case "♞": if((Math.abs(dr)===2&&Math.abs(dc)===1)||(Math.abs(dr)===1&&Math.abs(dc)===2)) return true; return false;
  }
  return false;
}

function pathClearSimulation(fr,fc,tr,tc,board){
  let dr = Math.sign(tr-fr), dc = Math.sign(tc-fc);
  let r=fr+dr, c=fc+dc;
  while(r!==tr || c!==tc){
    if(board[r][c]!=="") return false;
    r+=dr; c+=dc;
  }
  return true;
}

// Check any legal move exists
function anyLegalMove(color){
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      if(getColor(pieces[r][c])===color){
        for(let rr=0;rr<8;rr++){
          for(let cc=0;cc<8;cc++){
            if(isLegalMove(r,c,rr,cc)) return true;
          }
        }
      }
    }
  }
  return false;
}

// Basic move legality
function isLegalMove(fr,fc,tr,tc){
  let piece = pieces[fr][fc];
  if(!piece) return false;
  if(getColor(piece)!==turn) return false;
  let target = pieces[tr][tc];
  if(getColor(target)===turn) return false;
  let dr=tr-fr, dc=tc-fc;
  let legal=false;
  switch(piece){
    case "♙": legal=(dc===0 && dr===-1 && target==="")||(dc===0 && dr===-2 && fr===6 && pieces[fr-1][fc]==="")||(Math.abs(dc)===1&&dr===-1&&target!==""); break;
    case "♟": legal=(dc===0 && dr===1 && target==="")||(dc===0 && dr===2 && fr===1 && pieces[fr+1][fc]==="")||(Math.abs(dc)===1&&dr===1&&target!==""); break;
    case "♖": case "♜": legal=(dr===0||dc===0)&&pathClear(fr,fc,tr,tc); break;
    case "♗": case "♝": legal=(Math.abs(dr)===Math.abs(dc))&&pathClear(fr,fc,tr,tc); break;
    case "♕": case "♛": legal=(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))&&pathClear(fr,fc,tr,tc); break;
    case "♔": case "♚": legal=(Math.abs(dr)<=1&&Math.abs(dc)<=1)||(Math.abs(dc)===2&&dr===0); break; // include castling
    case "♘": case "♞": legal=(Math.abs(dr)===2&&Math.abs(dc)===1)||(Math.abs(dr)===1&&Math.abs(dc)===2); break;
  }
  if(!legal) return false;
  return !wouldBeInCheck(fr,fc,tr,tc);
}

// Click event
canvas.addEventListener("click", e=>{
  const rect = canvas.getBoundingClientRect();
  const col = Math.floor((e.clientX-rect.left)/tileSize);
  const row = Math.floor((e.clientY-rect.top)/tileSize);

  if(selected){
    if(isLegalMove(selected.row,selected.col,row,col)){
      let piece = pieces[selected.row][selected.col];

      // Handle castling
      if(piece==="♔" && col-selected.col===2){ pieces[row][col-1]=pieces[row][7]; pieces[row][7]=""; rookMoved.white.h=true;}
      if(piece==="♔" && col-selected.col===-2){ pieces[row][col+1]=pieces[row][0]; pieces[row][0]=""; rookMoved.white.a=true;}
      if(piece==="♚" && col-selected.col===2){ pieces[row][col-1]=pieces[row][7]; pieces[row][7]=""; rookMoved.black.h=true;}
      if(piece==="♚" && col-selected.col===-2){ pieces[row][col+1]=pieces[row][0]; pieces[row][0]=""; rookMoved.black.a=true;}

      pieces[row][col]=piece;
      pieces[selected.row][selected.col]="";

      // Pawn promotion
      if(piece==="♙" && row===0) pieces[row][col]="♕";
      if(piece==="♟" && row===7) pieces[row][col]="♛";

      // King/rook movement flags
      if(piece==="♔") kingMoved.white=true;
      if(piece==="♚") kingMoved.black=true;
      if(piece==="♖" && selected.col===0) rookMoved.white.a=true;
      if(piece==="♖" && selected.col===7) rookMoved.white.h=true;
      if(piece==="♜" && selected.col===0) rookMoved.black.a=true;
      if(piece==="♜" && selected.col===7) rookMoved.black.h=true;

      selected=null;
      turn = turn==="white"?"black":"white";

      // Check/checkmate
      if(isInCheck(turn)){
        if(!anyLegalMove(turn)) alert(turn+" is in checkmate! Game over.");
        else alert(turn+" is in check!");
      }
    } else selected=null;
  } else {
    if(pieces[row][col]!==""){
      let color = getColor(pieces[row][col]);
      if(color===turn) selected={row:row,col:col};
    }
  }

  drawBoard();
});

drawBoard();