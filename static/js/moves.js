function isLegalMove(fr, fc, tr, tc) {
    let piece = pieces[fr][fc];

    if (!piece) return false;
    if (getColor(piece) !== turn) return false;

    let target = pieces[tr][tc];
    if (getColor(target) === turn) return false;

    let dr = tr - fr;
    let dc = tc - fc;

    let legal = false;

    // En Passant (just check legality, do not modify pieces)
    if (enPassantTarget &&
        tr === enPassantTarget.row &&
        tc === enPassantTarget.col) {

        if ((piece === "♙" && dr === -1 && Math.abs(dc) === 1) ||
            (piece === "♟" && dr === 1 && Math.abs(dc) === 1)) {
            legal = true;
        }
    }

    // Normal moves
    switch (piece) {
        case "♙":
            legal = legal ||
                (dc === 0 && dr === -1 && target === "") ||
                (dc === 0 && dr === -2 && fr === 6 && pieces[fr - 1][fc] === "" && target === "") ||
                (Math.abs(dc) === 1 && dr === -1 && target !== "");
            break;

        case "♟":
            legal = legal ||
                (dc === 0 && dr === 1 && target === "") ||
                (dc === 0 && dr === 2 && fr === 1 && pieces[fr + 1][fc] === "" && target === "") ||
                (Math.abs(dc) === 1 && dr === 1 && target !== "");
            break;

        case "♖": case "♜":
            legal = (dr === 0 || dc === 0) && pathClear(fr, fc, tr, tc);
            break;

        case "♗": case "♝":
            legal = (Math.abs(dr) === Math.abs(dc)) && pathClear(fr, fc, tr, tc);
            break;

        case "♕": case "♛":
            legal = (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) && pathClear(fr, fc, tr, tc);
            break;

        case "♘": case "♞":
            legal = (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
            break;

        case "♔":
            legal = (Math.abs(dr) <= 1 && Math.abs(dc) <= 1);

            // Castling: king must not be in check, and must not pass through an attacked square
            if (fr === 7 && fc === 4 && !kingMoved.white && !isKingInCheck("white")) {

                // King-side: king passes through f1 (7,5) before landing on g1 (7,6)
                if (tr === 7 && tc === 6 && !rookMoved.white.h &&
                    pieces[7][5] === "" && pieces[7][6] === "") {
                    pieces[7][5] = "♔";
                    pieces[7][4] = "";
                    let f1Attacked = isKingInCheck("white");
                    pieces[7][4] = "♔";
                    pieces[7][5] = "";
                    if (!f1Attacked) legal = true;
                }

                // Queen-side: king passes through d1 (7,3) before landing on c1 (7,2)
                if (tr === 7 && tc === 2 && !rookMoved.white.a &&
                    pieces[7][1] === "" && pieces[7][2] === "" && pieces[7][3] === "") {
                    pieces[7][3] = "♔";
                    pieces[7][4] = "";
                    let d1Attacked = isKingInCheck("white");
                    pieces[7][4] = "♔";
                    pieces[7][3] = "";
                    if (!d1Attacked) legal = true;
                }
            }
            break;

        case "♚":
            legal = (Math.abs(dr) <= 1 && Math.abs(dc) <= 1);

            // Castling: king must not be in check, and must not pass through an attacked square
            if (fr === 0 && fc === 4 && !kingMoved.black && !isKingInCheck("black")) {

                // King-side: king passes through f8 (0,5) before landing on g8 (0,6)
                if (tr === 0 && tc === 6 && !rookMoved.black.h &&
                    pieces[0][5] === "" && pieces[0][6] === "") {
                    pieces[0][5] = "♚";
                    pieces[0][4] = "";
                    let f8Attacked = isKingInCheck("black");
                    pieces[0][4] = "♚";
                    pieces[0][5] = "";
                    if (!f8Attacked) legal = true;
                }

                // Queen-side: king passes through d8 (0,3) before landing on c8 (0,2)
                if (tr === 0 && tc === 2 && !rookMoved.black.a &&
                    pieces[0][1] === "" && pieces[0][2] === "" && pieces[0][3] === "") {
                    pieces[0][3] = "♚";
                    pieces[0][4] = "";
                    let d8Attacked = isKingInCheck("black");
                    pieces[0][4] = "♚";
                    pieces[0][3] = "";
                    if (!d8Attacked) legal = true;
                }
            }
            break;
    }

    if (!legal) return false;

    // Simulate move to verify king is not left in check.
    // For en passant, also remove the captured pawn during simulation.
    let temp = pieces[tr][tc];
    let epCaptureRow = -1, epCaptureCol = -1, epCapturePiece = "";

    if (enPassantTarget &&
        tr === enPassantTarget.row &&
        tc === enPassantTarget.col &&
        ((piece === "♙" && dr === -1 && Math.abs(dc) === 1) ||
         (piece === "♟" && dr === 1 && Math.abs(dc) === 1))) {
        epCaptureRow = (piece === "♙") ? tr + 1 : tr - 1;
        epCaptureCol = tc;
        epCapturePiece = pieces[epCaptureRow][epCaptureCol];
        pieces[epCaptureRow][epCaptureCol] = "";
    }

    pieces[tr][tc] = piece;
    pieces[fr][fc] = "";

    let inCheck = isKingInCheck(turn);

    // Undo simulation
    pieces[fr][fc] = piece;
    pieces[tr][tc] = temp;
    if (epCaptureRow !== -1) {
        pieces[epCaptureRow][epCaptureCol] = epCapturePiece;
    }

    if (inCheck) return false;

    return true;
}

/* Helper function: perform rook movement during castling */
function performCastling(color, side) {

    if (color === "white") {

        kingMoved.white = true;

        if (side === "kingSide") {
            pieces[7][5] = pieces[7][7];
            pieces[7][7] = "";
            rookMoved.white.h = true;
        } else if (side === "queenSide") {
            pieces[7][3] = pieces[7][0];
            pieces[7][0] = "";
            rookMoved.white.a = true;
        }

    } else {

        kingMoved.black = true;

        if (side === "kingSide") {
            pieces[0][5] = pieces[0][7];
            pieces[0][7] = "";
            rookMoved.black.h = true;
        } else if (side === "queenSide") {
            pieces[0][3] = pieces[0][0];
            pieces[0][0] = "";
            rookMoved.black.a = true;
        }

    }

}

/* CHECK DETECTION */

function isKingInCheck(color) {

    let kingRow = -1;
    let kingCol = -1;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            if (color === "white" && pieces[r][c] === "♔") {
                kingRow = r;
                kingCol = c;
            }

            if (color === "black" && pieces[r][c] === "♚") {
                kingRow = r;
                kingCol = c;
            }

        }
    }

    let enemy = color === "white" ? "black" : "white";

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            let p = pieces[r][c];

            if (getColor(p) === enemy) {

                if (isPseudoLegalMove(r, c, kingRow, kingCol)) {
                    return true;
                }

            }

        }
    }

    return false;

}


/* PSEUDO MOVE (used only for attack detection, no turn/color checks) */

function isPseudoLegalMove(fr, fc, tr, tc) {

    let piece = pieces[fr][fc];

    let dr = tr - fr;
    let dc = tc - fc;

    switch (piece) {

        case "♙":
            return Math.abs(dc) === 1 && dr === -1;

        case "♟":
            return Math.abs(dc) === 1 && dr === 1;

        case "♖":
        case "♜":
            return (dr === 0 || dc === 0) && pathClear(fr, fc, tr, tc);

        case "♗":
        case "♝":
            return (Math.abs(dr) === Math.abs(dc)) && pathClear(fr, fc, tr, tc);

        case "♕":
        case "♛":
            return (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) && pathClear(fr, fc, tr, tc);

        case "♘":
        case "♞":
            return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);

        case "♔":
        case "♚":
            return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;

    }

    return false;

}


/* CHECKMATE DETECTION */

function isCheckmate(color) {

    if (!isKingInCheck(color)) return false;

    for (let fr = 0; fr < 8; fr++) {
        for (let fc = 0; fc < 8; fc++) {

            if (getColor(pieces[fr][fc]) === color) {

                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {

                        if (isLegalMove(fr, fc, tr, tc)) {
                            return false;
                        }

                    }

                }

            }

        }

    }

    return true;

}

function makeMove(fr, fc, tr, tc) {

    let piece = pieces[fr][fc];

    // Handle en passant capture: remove the captured pawn
    if (enPassantTarget &&
        tr === enPassantTarget.row &&
        tc === enPassantTarget.col) {
        if (piece === "♙") pieces[tr + 1][tc] = "";
        if (piece === "♟") pieces[tr - 1][tc] = "";
    }

    // Move the piece
    pieces[tr][tc] = piece;
    pieces[fr][fc] = "";

    // Handle castling: move the rook too
    if (piece === "♔" && fr === 7 && fc === 4) {
        kingMoved.white = true;
        if (tc === 6) {
            pieces[7][5] = pieces[7][7];
            pieces[7][7] = "";
            rookMoved.white.h = true;
        }
        if (tc === 2) {
            pieces[7][3] = pieces[7][0];
            pieces[7][0] = "";
            rookMoved.white.a = true;
        }
    }
    if (piece === "♚" && fr === 0 && fc === 4) {
        kingMoved.black = true;
        if (tc === 6) {
            pieces[0][5] = pieces[0][7];
            pieces[0][7] = "";
            rookMoved.black.h = true;
        }
        if (tc === 2) {
            pieces[0][3] = pieces[0][0];
            pieces[0][0] = "";
            rookMoved.black.a = true;
        }
    }

    // Update rook/king moved flags for normal rook/king moves
    if (piece === "♖" && fr === 7 && fc === 0) rookMoved.white.a = true;
    if (piece === "♖" && fr === 7 && fc === 7) rookMoved.white.h = true;
    if (piece === "♜" && fr === 0 && fc === 0) rookMoved.black.a = true;
    if (piece === "♜" && fr === 0 && fc === 7) rookMoved.black.h = true;
    if (piece === "♔") kingMoved.white = true;
    if (piece === "♚") kingMoved.black = true;

    // Pawn promotion
    if (piece === "♙" && tr === 0) pieces[tr][tc] = "♕";
    if (piece === "♟" && tr === 7) pieces[tr][tc] = "♛";

    // Set en passant target for double pawn push, clear otherwise
    enPassantTarget = null;
    if (piece === "♙" && fr === 6 && tr === 4) enPassantTarget = { row: 5, col: tc };
    if (piece === "♟" && fr === 1 && tr === 3) enPassantTarget = { row: 2, col: tc };
}

