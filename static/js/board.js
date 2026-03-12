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

function drawBoard(){
    let checkKing = null;
    if(isKingInCheck("white")) checkKing = getKingSquare("white");
    else if(isKingInCheck("black")) checkKing = getKingSquare("black");

    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            ctx.fillStyle=(r+c)%2===0?lightColor:darkColor;

            // Highlight selected square
            if(selected && selected.row===r && selected.col===c){
                ctx.fillStyle="rgba(255,255,0,0.5)";
            }

            // Highlight king in check
            if(checkKing && checkKing.row===r && checkKing.col===c){
                ctx.fillStyle="rgba(255,0,0,0.5)";
            }

            ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);

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