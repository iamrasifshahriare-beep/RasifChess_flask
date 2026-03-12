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

        case "♘": case "♞":
            legal=(Math.abs(dr)===2 && Math.abs(dc)===1) || (Math.abs(dr)===1 && Math.abs(dc)===2);
        break;

        case "♔":
            legal=(Math.abs(dr)<=1 && Math.abs(dc)<=1);

            /* CASTLING WHITE */
            if(fr===7 && fc===4 && !kingMoved.white){

                /* King side */
                if(tr===7 && tc===6 && !rookMoved.white.h &&
                   pieces[7][5]==="" && pieces[7][6]===""){
                    legal=true;
                    performCastling("white","kingSide");
                }

                /* Queen side */
                if(tr===7 && tc===2 && !rookMoved.white.a &&
                   pieces[7][1]==="" && pieces[7][2]==="" && pieces[7][3]===""){
                    legal=true;
                    performCastling("white","queenSide");
                }

            }

        break;

        case "♚":
            legal=(Math.abs(dr)<=1 && Math.abs(dc)<=1);

            /* CASTLING BLACK */
            if(fr===0 && fc===4 && !kingMoved.black){

                /* King side */
                if(tr===0 && tc===6 && !rookMoved.black.h &&
                   pieces[0][5]==="" && pieces[0][6]===""){
                    legal=true;
                    performCastling("black","kingSide");
                }

                /* Queen side */
                if(tr===0 && tc===2 && !rookMoved.black.a &&
                   pieces[0][1]==="" && pieces[0][2]==="" && pieces[0][3]===""){
                    legal=true;
                    performCastling("black","queenSide");
                }

            }
        break;

    }

    if(!legal) return false;

    /* CHECK PREVENTION */
    let temp=pieces[tr][tc];
    pieces[tr][tc]=piece;
    pieces[fr][fc]="";

    let inCheck=isKingInCheck(turn);

    /* undo move */
    pieces[fr][fc]=piece;
    pieces[tr][tc]=temp;

    if(inCheck) return false;

    return true;

}


/* Helper function: perform rook movement during castling */
function performCastling(color, side){

    if(color==="white"){

        kingMoved.white=true;

        if(side==="kingSide"){
            pieces[7][5] = pieces[7][7]; // move rook
            pieces[7][7] = "";
            rookMoved.white.h = true;
        }else if(side==="queenSide"){
            pieces[7][3] = pieces[7][0]; // move rook
            pieces[7][0] = "";
            rookMoved.white.a = true;
        }

    }else{

        kingMoved.black=true;

        if(side==="kingSide"){
            pieces[0][5] = pieces[0][7];
            pieces[0][7] = "";
            rookMoved.black.h = true;
        }else if(side==="queenSide"){
            pieces[0][3] = pieces[0][0];
            pieces[0][0] = "";
            rookMoved.black.a = true;
        }

    }

}

/* CHECK DETECTION */

function isKingInCheck(color){

let kingRow=-1;
let kingCol=-1;

for(let r=0;r<8;r++){
for(let c=0;c<8;c++){

if(color==="white" && pieces[r][c]==="♔"){
kingRow=r;
kingCol=c;
}

if(color==="black" && pieces[r][c]==="♚"){
kingRow=r;
kingCol=c;
}

}
}

let enemy=color==="white"?"black":"white";

for(let r=0;r<8;r++){
for(let c=0;c<8;c++){

let p=pieces[r][c];

if(getColor(p)===enemy){

if(isPseudoLegalMove(r,c,kingRow,kingCol)){
return true;
}

}

}
}

return false;

}



/* PSEUDO MOVE (used only for attack detection) */

function isPseudoLegalMove(fr,fc,tr,tc){

let piece=pieces[fr][fc];

let dr=tr-fr;
let dc=tc-fc;

switch(piece){

case "♙":
return Math.abs(dc)===1 && dr===-1;

case "♟":
return Math.abs(dc)===1 && dr===1;

case "♖": case "♜":
return (dr===0||dc===0)&&pathClear(fr,fc,tr,tc);

case "♗": case "♝":
return (Math.abs(dr)===Math.abs(dc))&&pathClear(fr,fc,tr,tc);

case "♕": case "♛":
return (dr===0||dc===0||Math.abs(dr)===Math.abs(dc))&&pathClear(fr,fc,tr,tc);

case "♘": case "♞":
return (Math.abs(dr)===2 && Math.abs(dc)===1) || (Math.abs(dr)===1 && Math.abs(dc)===2);

case "♔": case "♚":
return Math.abs(dr)<=1 && Math.abs(dc)<=1;

}

return false;

}



/* CHECKMATE DETECTION */

function isCheckmate(color){

if(!isKingInCheck(color)) return false;

for(let fr=0;fr<8;fr++){
for(let fc=0;fc<8;fc++){

if(getColor(pieces[fr][fc])===color){

for(let tr=0;tr<8;tr++){
for(let tc=0;tc<8;tc++){

if(isLegalMove(fr,fc,tr,tc)){
return false;
}

}

}

}

}

}

return true;

}

function getKingSquare(color){
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            if(color==="white" && pieces[r][c]==="♔") return {row:r,col:c};
            if(color==="black" && pieces[r][c]==="♚") return {row:r,col:c};
        }
    }
    return null;
}