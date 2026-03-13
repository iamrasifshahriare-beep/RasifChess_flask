/* =========================================
   UTILITY FUNCTIONS
========================================= */

/* Determine piece color */
function getColor(piece){

    if(!piece) return null;

    const whitePieces=["♙","♖","♘","♗","♕","♔"];
    const blackPieces=["♟","♜","♞","♝","♛","♚"];

    if(whitePieces.includes(piece)) return "white";
    if(blackPieces.includes(piece)) return "black";

    return null;

}


/* Find king position (used for check highlighting) */
function getKingSquare(color){

    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){

            if(color==="white" && pieces[r][c]==="♔"){
                return {row:r,col:c};
            }

            if(color==="black" && pieces[r][c]==="♚"){
                return {row:r,col:c};
            }

        }
    }

    return null;

}


/* Check if coordinates are inside board */
function inBounds(r,c){

    return r>=0 && r<8 && c>=0 && c<8;

}


/* Check if path between two squares is clear
   (used for rook, bishop, queen) */
function pathClear(fr,fc,tr,tc){

    let dr=Math.sign(tr-fr);
    let dc=Math.sign(tc-fc);

    let r=fr+dr;
    let c=fc+dc;

    while(r!==tr || c!==tc){

        if(pieces[r][c] !== "") return false;

        r+=dr;
        c+=dc;

    }

    return true;

}