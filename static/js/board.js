const canvas = document.getElementById("chessCanvas");
const ctx = canvas.getContext("2d");

const boardSize = 8;
const tileSize = canvas.width / boardSize;

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

let selected = null;
let turn = "white";
let legalMoves = [];

function drawBoard(){

    let checkKing = null;

    if(isKingInCheck("white")) checkKing = getKingSquare("white");
    else if(isKingInCheck("black")) checkKing = getKingSquare("black");

    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){

            // Default tile color
            ctx.fillStyle = (r + c) % 2 === 0 ? lightColor : darkColor;

            // Highlight selected square (yellow)
            if(selected && selected.row === r && selected.col === c){
                ctx.fillStyle = "rgba(255,255,0,0.5)";
            }

            // Highlight king in check (red)
            if(checkKing && checkKing.row === r && checkKing.col === c){
                ctx.fillStyle = "rgba(255,0,0,0.5)";
            }

            // Draw the tile
            ctx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);

            // 🔹 Highlight legal moves (blue glow)
            for(let move of legalMoves){
                if(move.row === r && move.col === c){
                    ctx.beginPath();
                    ctx.arc(
                        c*tileSize + tileSize/2,
                        r*tileSize + tileSize/2,
                        tileSize/6,
                        0,
                        Math.PI*2
                    );

                    // Special moves brighter
                    let isSpecial = false;

                    // Castling squares
                    if(selected && pieces[selected.row][selected.col] === "♔" || pieces[selected.row][selected.col] === "♚"){
                        if((selected.row === r && (c === 2 || c === 6))){
                            isSpecial = true;
                        }
                    }

                    // En passant square
                    if(enPassantTarget && enPassantTarget.row === r && enPassantTarget.col === c){
                        isSpecial = true;
                    }

                    ctx.fillStyle = isSpecial ? "rgba(0,0,255,0.9)" : "rgba(0,0,255,0.6)";
                    ctx.fill();
                }
            }

            // Draw pieces
            if(pieces[r][c] !== ""){
                ctx.fillStyle = "black";
                ctx.font = `${tileSize-10}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    pieces[r][c],
                    c*tileSize + tileSize/2,
                    r*tileSize + tileSize/2
                );
            }

        }
    }

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