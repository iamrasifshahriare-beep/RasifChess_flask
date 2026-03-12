function getColor(piece){
if(piece==="") return null;

const code=piece.charCodeAt(0);

if(code>=9812 && code<=9817) return "white";
if(code>=9818 && code<=9823) return "black";

return null;
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