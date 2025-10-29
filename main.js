// ============================
//  SECTION 1: INITIALIZATION
// ============================

// Game Variables
let draggedPiece = null;
let currentPlayer = 'white';
let validMoveSquares = [];

// Timer Variables
let whiteTime = 600;
let blackTime = 600;
let timerInterval;

const whiteTimer = document.getElementById('timer-white');
const blackTimer = document.getElementById('timer-black');

// Initialize game
function initGame() {
    const blackPieces = document.querySelectorAll('img.black:not(.overlay)');
    const whitePieces = document.querySelectorAll('img.white:not(.overlay)');
    const squares = document.querySelectorAll('.column');

    // Initialize pieces
    [...blackPieces, ...whitePieces].forEach(piece => {
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);
        piece.draggable = true;
    });

    // Initialize squares
    squares.forEach(square => {
        square.addEventListener('dragover', handleDragOver);
        square.addEventListener('drop', handleDrop);
    });

    startTimer();
}

//Setup Board
function initializeBoard() {
    const board = document.querySelector('.chessBoard');
    board.innerHTML = "";
    const files = 8;
    const ranks = 8;
    const setup = {
        white: {
            1: ["benteng", "kuda", "cumcum", "ratu", "raja", "cumcum", "kuda", "benteng"],
            2: ["pion", "pion", "pion", "pion", "pion", "pion", "pion", "pion"]
        },
        black: {
            8: ["benteng", "kuda", "cumcum", "ratu", "raja", "cumcum", "kuda", "benteng"],
            7: ["pion", "pion", "pion", "pion", "pion", "pion", "pion", "pion"]
        }
    };

    for (let r = 1; r <= ranks; r++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let c = 1; c <= files; c++) {
            const col = document.createElement('div');
            col.classList.add('column');
            if ((r + c) % 2 === 0) col.classList.add('black');
            col.id = `row-${r}-column-${c}`;

            const overlay = document.createElement('img');
            overlay.src = "../img/SpriteRumpurOverlay.png";
            overlay.classList.add('overlay');
            col.appendChild(overlay);

            if (setup.white[c] && setup.white[c][r - 1]) {
                const piece = document.createElement('img');
                piece.src = `../img/Sprite${capitalize(setup.white[c][r - 1])}Chess.png`;
                piece.classList.add(setup.white[c][r - 1], "white");
                col.appendChild(piece);
            }

            if (setup.black[c] && setup.black[c][r - 1]) {
                const piece = document.createElement('img');
                piece.src = `../img/Sprite${capitalize(setup.black[c][r - 1])}Chess.png`;
                piece.classList.add(setup.black[c][r - 1], "black");
                col.appendChild(piece);
            }

            row.appendChild(col);
        }
        board.appendChild(row);
    }
    initGame();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// ============================
//  SECTION 2: TIMER FUNCTIONS
// ============================

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (currentPlayer === 'white') {
            whiteTime--;
            if (whiteTime <= 0) {
                clearInterval(timerInterval);
                alert('Black wins by timeout!');
                return;
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                clearInterval(timerInterval);
                alert('White wins by timeout!');
                return;
            }
        }
        updateTimers();
    }, 1000);
}

function updateTimers() {
    whiteTimer.textContent = formatTime(whiteTime);
    blackTimer.textContent = formatTime(blackTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ============================
//  SECTION 3: DRAG & DROP
// ============================

function handleDragStart(event) {
    const pieceColor = event.target.classList.contains('white') ? 'white' : 'black';
    if (pieceColor !== currentPlayer) {
        event.preventDefault();
        return;
    }

    draggedPiece = event.target;
    event.target.classList.add('dragging');

    const currentSquare = event.target.parentElement;
    validMoveSquares = calculateValidMoves(event.target, currentSquare);
    highlightValidMoves(validMoveSquares);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    clearHighlights();
    draggedPiece = null;
    validMoveSquares = [];
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    if (!draggedPiece) return;

    const targetSquare = event.currentTarget;
    const targetSquareId = targetSquare.id;

    if (!validMoveSquares.includes(targetSquareId)) return;

    const existingPiece = targetSquare.querySelector('img:not(.overlay)');
    const overlay = targetSquare.querySelector('.overlay');
    const pieceColor = draggedPiece.classList.contains('white') ? 'white' : 'black';

    // Capture logic
    if (existingPiece) {
        const targetPieceColor = existingPiece.classList.contains('white') ? 'white' : 'black';
        if (targetPieceColor === pieceColor) return;
        existingPiece.remove();
    }

    // Move
    draggedPiece.remove();
    targetSquare.insertBefore(draggedPiece, overlay || null);
    draggedPiece.classList.remove('dragging');
    draggedPiece = null;

    clearHighlights();
    validMoveSquares = [];
    checkGameOver();
    switchTurn();
}

// ============================
//  SECTION 4: MOVEMENT LOGIC
// ============================

function calculateValidMoves(piece, currentSquare, ignoreCheck = false) {
    const pieceType = Array.from(piece.classList).find(cls =>
        ['benteng', 'kuda', 'cumcum', 'ratu', 'raja', 'pion'].includes(cls)
    ) || 'pion';

    const currentId = currentSquare.id;
    const rowNum = parseInt(currentId.split('-')[1]);
    const colNum = parseInt(currentId.split('-')[3]);
    let validSquares = [];
    const pieceColor = piece.classList.contains('white') ? 'white' : 'black';

    // Arah bidak
    switch (pieceType) {
        case 'benteng':
            checkDirection(rowNum, colNum, 1, 0, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, 0, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 0, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 0, -1, validSquares, pieceColor);
            break;

        case 'cumcum':
            checkDirection(rowNum, colNum, 1, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 1, -1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, -1, validSquares, pieceColor);
            break;

        case 'ratu':
            checkDirection(rowNum, colNum, 1, 0, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, 0, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 0, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 0, -1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 1, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 1, -1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, -1, validSquares, pieceColor);
            break;

        case 'kuda':
            const knightMoves = [
                [2, 1], [2, -1], [-2, 1], [-2, -1],
                [1, 2], [1, -2], [-1, 2], [-1, -2]
            ];
            knightMoves.forEach(([rDiff, cDiff]) => {
                const newRow = rowNum + rDiff;
                const newCol = colNum + cDiff;
                if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                    const squareId = `row-${newRow}-column-${newCol}`;
                    const square = document.getElementById(squareId);
                    const target = square.querySelector('img:not(.overlay)');
                    if (!target || target.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                        validSquares.push(squareId);
                    }
                }
            });
            break;

        case 'raja':
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    if (r === 0 && c === 0) continue;
                    const newRow = rowNum + r;
                    const newCol = colNum + c;
                    if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                        const squareId = `row-${newRow}-column-${newCol}`;
                        const square = document.getElementById(squareId);
                        const target = square.querySelector('img:not(.overlay)');
                        if (!target || target.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                            validSquares.push(squareId);
                        }
                    }
                }
            }
            break;

        case 'pion':
            const dir = pieceColor === 'white' ? 1 : -1;
            const startCol = pieceColor === 'white' ? 2 : 7;

            const forwardCol = colNum + dir;
            if (forwardCol >= 1 && forwardCol <= 8) {
                const fwdId = `row-${rowNum}-column-${forwardCol}`;
                const fwdSquare = document.getElementById(fwdId);
                const fwdPiece = fwdSquare.querySelector('img:not(.overlay)');
                if (!fwdPiece) {
                    validSquares.push(fwdId);
                    if (colNum === startCol) {
                        const dblCol = colNum + (2 * dir);
                        const dblId = `row-${rowNum}-column-${dblCol}`;
                        const dblSquare = document.getElementById(dblId);
                        const midSquare = document.getElementById(`row-${rowNum}-column-${colNum + dir}`);
                        if (!dblSquare.querySelector('img:not(.overlay)') && !midSquare.querySelector('img:not(.overlay)')) {
                            validSquares.push(dblId);
                        }
                    }
                }
            }

            // Tangkap secara diagonal (horizontal board)
            const captureCols = [colNum + dir];
            const captureRows = [rowNum - 1, rowNum + 1];
            captureRows.forEach(r => {
                captureCols.forEach(c => {
                    if (r >= 1 && r <= 8 && c >= 1 && c <= 8) {
                        const capId = `row-${r}-column-${c}`;
                        const capSquare = document.getElementById(capId);
                        const capPiece = capSquare?.querySelector('img:not(.overlay)');
                        if (capPiece && capPiece.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                            validSquares.push(capId);
                        }
                    }
                });
            });
            break;
    }

    if (!ignoreCheck) {
        validSquares = validSquares.filter(squareId => {
            const toSquare = document.getElementById(squareId);
            return simulateMoveAndCheck(piece, currentSquare, toSquare, pieceColor);
        });
    }

    return validSquares;
}



function checkDirection(startRow, startCol, rowStep, colStep, validSquares, pieceColor) {
    let r = startRow + rowStep;
    let c = startCol + colStep;

    while (r >= 1 && r <= 8 && c >= 1 && c <= 8) {
        const squareId = `row-${r}-column-${c}`;
        const square = document.getElementById(squareId);
        if (!square) break;

        const targetPiece = square.querySelector('img:not(.overlay)');
        if (targetPiece) {
            if (targetPiece.classList.contains(pieceColor)) break;
            validSquares.push(squareId);
            break;
        } else validSquares.push(squareId);

        r += rowStep;
        c += colStep;
    }
}

// ============================
//  SECTION 5: UI FUNCTIONS
// ============================

function highlightValidMoves(squareIds) {
    clearHighlights();
    squareIds.forEach(id => {
        const square = document.getElementById(id);
        if (square) {
            const existingPiece = square.querySelector('img:not(.overlay)');
            square.classList.add(existingPiece ? 'valid-capture' : 'valid-move');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.valid-move, .valid-capture')
        .forEach(square => square.classList.remove('valid-move', 'valid-capture'));
}

function switchTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnIndicator();
    startTimer();

    setTimeout(() => evaluateGameState(), 100);
}


function updateTurnIndicator() {
    console.log(`Current turn: ${currentPlayer}`);
}

// ============================
//  SECTION 6: GAME STATE & CHECK LOGIC
// ============================

let gameOver = false;

function stopGame(result) {
    if (gameOver) return;
    gameOver = true;
    clearInterval(timerInterval);
    document.querySelectorAll('img:not(.overlay)').forEach(p => p.draggable = false);

    if (result === 'draw') alert('Game drawn!');
    else alert(`${result.charAt(0).toUpperCase() + result.slice(1)} wins!`);
}


function isKingInCheck(color) {
    const king = document.querySelector(`img.raja.${color}`);
    if (!king) return false;

    const kingSquare = king.closest('.column');
    if (!kingSquare) return false;

    const kingId = kingSquare.id;
    const [_, row, __, col] = kingId.split('-');
    const kingRow = parseInt(row);
    const kingCol = parseInt(col);

    const opponentColor = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(kingRow, kingCol, opponentColor);
}


function simulateMoveAndCheck(piece, fromSquare, toSquare, color) {
    if (typeof fromSquare === "string") fromSquare = document.getElementById(fromSquare);
    if (typeof toSquare === "string") toSquare = document.getElementById(toSquare);

    if (!fromSquare || !toSquare) return false;

    const captured = toSquare.querySelector('img:not(.overlay)');
    const overlay = toSquare.querySelector('.overlay');
    const originalParent = fromSquare;
    const originalNext = piece.nextSibling;

    if (captured) captured.remove();
    toSquare.insertBefore(piece, overlay || null);

    const inCheck = isKingInCheck(color);

    piece.remove();
    if (originalNext) originalParent.insertBefore(piece, originalNext);
    else originalParent.appendChild(piece);
    if (captured) toSquare.insertBefore(captured, overlay || null);

    return !inCheck;
}


function isSquareAttacked(row, col, byColor) {
    const opponentColor = byColor;
    const directions = [
        { dr: 1, dc: 0 }, { dr: -1, dc: 0 }, // Vertikal
        { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, // Horizontal
        { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
        { dr: -1, dc: 1 }, { dr: -1, dc: -1 },
    ];

    for (let r = 1; r <= 8; r++) {
        for (let c = 1; c <= 8; c++) {
            const square = document.getElementById(`row-${r}-column-${c}`);
            const piece = square?.querySelector('img:not(.overlay)');
            if (!piece || !piece.classList.contains(opponentColor)) continue;

            const type = ['benteng', 'kuda', 'cumcum', 'ratu', 'raja', 'pion']
                .find(cls => piece.classList.contains(cls));

            // Benteng & Ratu (garis lurus)
            if (type === 'benteng' || type === 'ratu') {
                for (const { dr, dc } of directions.slice(0, 4)) {
                    let nr = r + dr, nc = c + dc;
                    while (nr >= 1 && nr <= 8 && nc >= 1 && nc <= 8) {
                        if (nr === row && nc === col) return true;
                        const pieceHere = document.getElementById(`row-${nr}-column-${nc}`)?.querySelector('img:not(.overlay)');
                        if (pieceHere) break;
                        nr += dr; nc += dc;
                    }
                }
            }

            // Gajah (cumcum) & Ratu (diagonal)
            if (type === 'cumcum' || type === 'ratu') {
                for (const { dr, dc } of directions.slice(4)) {
                    let nr = r + dr, nc = c + dc;
                    while (nr >= 1 && nr <= 8 && nc >= 1 && nc <= 8) {
                        if (nr === row && nc === col) return true;
                        const pieceHere = document.getElementById(`row-${nr}-column-${nc}`)?.querySelector('img:not(.overlay)');
                        if (pieceHere) break;
                        nr += dr; nc += dc;
                    }
                }
            }

            // Kuda
            if (type === 'kuda') {
                const moves = [
                    [2, 1], [2, -1], [-2, 1], [-2, -1],
                    [1, 2], [1, -2], [-1, 2], [-1, -2]
                ];
                for (const [dr, dc] of moves) {
                    const nr = r + dr, nc = c + dc;
                    if (nr === row && nc === col) return true;
                }
            }

            // Raja
            if (type === 'raja') {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        if (r + dr === row && c + dc === col) return true;
                    }
                }
            }

            // Pion
            if (type === 'pion') {
                const attackDir = opponentColor === 'white' ? -1 : 1;
                const attackRows = [r + attackDir];
                const attackCols = [c - 1, c + 1]; 

                for (let ar of attackRows) {
                    for (let ac of attackCols) {
                        if (ar >= 1 && ar <= 8 && ac >= 1 && ac <= 8) {
                            if (ar === row && ac === col) return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}


function disableBoard() {
    const allColumns = document.querySelectorAll('.column');
    allColumns.forEach(col => col.style.pointerEvents = 'none');
}


function countLegalMovesForPlayer(color) {
    const pieces = document.querySelectorAll(`.${color}:not(.overlay)`);
    let totalLegalMoves = 0;

    pieces.forEach(piece => {
        const fromSquare = piece.parentElement;
        const currentMoves = calculateValidMoves(piece, fromSquare);
        totalLegalMoves += currentMoves.length;
    });

    return totalLegalMoves;
}


function evaluateGameState() {
    const whiteInCheck = isKingInCheck("white");
    const blackInCheck = isKingInCheck("black");
    const whiteMoves = countLegalMovesForPlayer("white");
    const blackMoves = countLegalMovesForPlayer("black");
    console.log(`White in check: ${whiteInCheck}, legal moves: ${whiteMoves}`);
    console.log(`Black in check: ${blackInCheck}, legal moves: ${blackMoves}`);
    const resultDiv = document.getElementById("game-result");

    // --- Checkmate
    if (whiteInCheck && whiteMoves === 0) {
        showGameOverOverlay("🔥 Checkmate! Black wins!");
        disableBoard();
        return "black-wins";
    }
    if (blackInCheck && blackMoves === 0) {
        showGameOverOverlay("🔥 Checkmate! White wins!");
        disableBoard();
        return "white-wins";
    }

    // --- Stalemate (no moves but not in check)
    if (!whiteInCheck && whiteMoves === 0) {
        showGameOverOverlay("😐 Stalemate! It's a draw.");
        disableBoard();
        return "draw";
    }
    if (!blackInCheck && blackMoves === 0) {
        showGameOverOverlay("😐 Stalemate! It's a draw.");
        disableBoard();
        return "draw";
    }

    return "continue";
}


// ============================
//  SECTION 7: MOVE FILTERING & VALIDATION
// ============================

document.addEventListener('dragstart', (evt) => {
    setTimeout(() => {
        const piece = evt.target;
        if (!piece || piece.tagName !== 'IMG' || piece.classList.contains('overlay')) return;
        if (draggedPiece !== piece) return;

        const pieceColor = piece.classList.contains('white') ? 'white' : 'black';
        const opponentColor = pieceColor === 'white' ? 'black' : 'white';

        const filtered = validMoveSquares.filter(targetId => {
            const targetSquare = document.getElementById(targetId);
            if (!targetSquare) return false;

            if (piece.classList.contains('raja') && isSquareAttacked(...targetId.split('-').filter(x => !isNaN(x)), opponentColor)) {
                return false;
            }

            return simulateMoveAndCheck(piece, piece.parentElement, targetSquare, pieceColor);
        });


        validMoveSquares = filtered;
        highlightValidMoves(validMoveSquares);

        if (validMoveSquares.length === 0) {
            piece.classList.remove('dragging');
            draggedPiece = null;
            clearHighlights();
        }
    }, 0);
});


// ============================
//  SECTION 8: VISUAL & ALERT IMPROVEMENTS
// ============================

// Prevent flashing on highlights (debounce)
(function() {
    const ORIGINAL_HIGHLIGHT = window.highlightValidMoves;
    const ORIGINAL_CLEAR = window.clearHighlights;
    let highlightTimer = null;
    const HIGHLIGHT_DELAY_MS = 40;

    window.highlightValidMoves = function(squareIds) {
        if (highlightTimer) clearTimeout(highlightTimer);
        highlightTimer = setTimeout(() => {
            highlightTimer = null;
            ORIGINAL_HIGHLIGHT(squareIds);
        }, HIGHLIGHT_DELAY_MS);
    };

    window.clearHighlights = function() {
        if (highlightTimer) {
            clearTimeout(highlightTimer);
            highlightTimer = null;
        }
        ORIGINAL_CLEAR();
    };
})();

// Custom alert replacement
(function() {
    const originalAlert = window.alert.bind(window);
    const resultEl = document.getElementById('game-result');

    function renderResult(message) {
        if (!resultEl) return originalAlert(message);
        resultEl.textContent = message;
        resultEl.classList.remove('hidden');
    }

    function clearResult() {
        if (resultEl) {
            resultEl.textContent = '';
            resultEl.classList.add('hidden');
        }
    }

    window.alert = renderResult;
    window.showGameResult = renderResult;
    window.clearGameResult = clearResult;

    if (typeof window.initGame === 'function') {
        const _initGame = window.initGame;
        window.initGame = function() {
            clearResult();
            return _initGame();
        };
    }
})();

// ============================
//  SECTION 9: GAME FEATURE
// ============================

function showGameOverOverlay(message) {
    let overlay = document.getElementById("game-over-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "game-over-overlay";
        overlay.innerHTML = `
            <div>
                <h1 id="game-over-message">${message}</h1>
                <button onclick="restartGame()">Restart Game</button>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        document.getElementById("game-over-message").textContent = message;
        overlay.style.display = "flex";
    }
}

function restartGame() {
    const overlay = document.getElementById("game-over-overlay");
    if (overlay) overlay.remove(); // Hapus overlay

    const board = document.getElementById("chess-board");
    if (board) {
        board.innerHTML = "";
    }

    if (typeof initializeBoard === "function") {
        initializeBoard();
    } else {
        console.error("Fungsi initializeBoard tidak ditemukan!");
    }

    currentPlayer = "white";
}


function checkGameOver() {
    const whiteKing = document.querySelector('.white.raja');
    const blackKing = document.querySelector('.black.raja');

    if (!whiteKing) {
        showGameOverOverlay('Black');
    } else if (!blackKing) {
        showGameOverOverlay('White');
    }
}

// ============================
//  SECTION 10: GAME STARTUP
// ============================

document.querySelectorAll('.column').forEach(square => {
    square.addEventListener('drop', () => setTimeout(evaluateGameState, 0));
});

initGame();
updateTimers();
evaluateGameState();

// ============================
//  END OF FILE
// ============================


