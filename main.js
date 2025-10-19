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
    // Get all pieces and squares
    const blackPieces = document.querySelectorAll('img.black:not(.overlay)');
    const whitePieces = document.querySelectorAll('img.white:not(.overlay)');
    const squares = document.querySelectorAll('.column');

    // Initialize pieces
    blackPieces.forEach(blackPiece => {
        blackPiece.addEventListener('dragstart', handleDragStart);
        blackPiece.addEventListener('dragend', handleDragEnd);
        blackPiece.draggable = true;
    });

    whitePieces.forEach(whitePiece => {
        whitePiece.addEventListener('dragstart', handleDragStart);
        whitePiece.addEventListener('dragend', handleDragEnd);
        whitePiece.draggable = true;
    });

    // Initialize squares
    squares.forEach(square => {
        square.addEventListener('dragover', handleDragOver);
        square.addEventListener('drop', handleDrop);
    });
    
    // Start timer
    startTimer();
}

// Timer functions
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

// Drag and drop functions
function handleDragStart(event) {
    const pieceColor = event.target.classList.contains('white') ? 'white' : 'black';
    if (pieceColor !== currentPlayer) {
        event.preventDefault();
        return;
    }
    
    draggedPiece = event.target;
    event.target.classList.add('dragging');
    
    // Calculate and highlight valid moves
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

    // Check if the target square is a valid move
    if (!validMoveSquares.includes(targetSquareId)) {
        return;
    }
    
    const existingPiece = targetSquare.querySelector('img:not(.overlay)');
    const overlay = targetSquare.querySelector('.overlay');
    const pieceColor = draggedPiece.classList.contains('white') ? 'white' : 'black';
    
    // Capture logic
    if (existingPiece) {
        const targetPieceColor = existingPiece.classList.contains('white') ? 'white' : 'black';
        if (targetPieceColor === pieceColor) {
            return; // Can't capture your own piece
        }
        existingPiece.remove(); // Capture opponent's piece
    }
    
    // Move the piece
    draggedPiece.remove();
    targetSquare.insertBefore(draggedPiece, overlay || null);
    
    draggedPiece.classList.remove('dragging');
    draggedPiece = null;
    
    // Clear highlights and switch turns
    clearHighlights();
    validMoveSquares = [];
    switchTurn();
}

// Movement calculation functions
function calculateValidMoves(piece, currentSquare) {
    const pieceType = Array.from(piece.classList).find(cls => 
        ['benteng', 'kuda', 'cumcum', 'ratu', 'raja', 'pion'].includes(cls)) || 'pion';

    const currentId = currentSquare.id;
    const rowNum = parseInt(currentId.split('-')[1]);
    const colNum = parseInt(currentId.split('-')[3]);
    let validSquares = [];
    const pieceColor = piece.classList.contains('white') ? 'white' : 'black';

    switch(pieceType) {
        case 'benteng': // Rook - straight movement
            // Horizontal and vertical moves
            checkDirection(rowNum, colNum, 1, 0, validSquares, pieceColor);  // Down
            checkDirection(rowNum, colNum, -1, 0, validSquares, pieceColor); // Up
            checkDirection(rowNum, colNum, 0, 1, validSquares, pieceColor);  // Right
            checkDirection(rowNum, colNum, 0, -1, validSquares, pieceColor); // Left
            break;

        case 'kuda': // Knight - L-shaped movement
            const knightMoves = [
                [2, 1], [2, -1], [-2, 1], [-2, -1],
                [1, 2], [1, -2], [-1, 2], [-1, -2]
            ];
            knightMoves.forEach(([rowDiff, colDiff]) => {
                const newRow = rowNum + rowDiff;
                const newCol = colNum + colDiff;
                if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                    const squareId = `row-${newRow}-column-${newCol}`;
                    const square = document.getElementById(squareId);
                    const targetPiece = square.querySelector('img:not(.overlay)');
                    
                    if (!targetPiece || targetPiece.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                        validSquares.push(squareId);
                    }
                }
            });
            break;

        case 'cumcum': // Bishop - diagonal movement
            checkDirection(rowNum, colNum, 1, 1, validSquares, pieceColor);   // Down-right
            checkDirection(rowNum, colNum, 1, -1, validSquares, pieceColor);  // Down-left
            checkDirection(rowNum, colNum, -1, 1, validSquares, pieceColor);  // Up-right
            checkDirection(rowNum, colNum, -1, -1, validSquares, pieceColor); // Up-left
            break;

        case 'ratu': // Queen - combination of rook and bishop
            // Rook moves
            checkDirection(rowNum, colNum, 1, 0, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, 0, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 0, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 0, -1, validSquares, pieceColor);
            // Bishop moves
            checkDirection(rowNum, colNum, 1, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, 1, -1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, 1, validSquares, pieceColor);
            checkDirection(rowNum, colNum, -1, -1, validSquares, pieceColor);
            break;

        case 'raja': // King - one square in any direction
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    if (r === 0 && c === 0) continue;
                    const newRow = rowNum + r;
                    const newCol = colNum + c;
                    if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                        const squareId = `row-${newRow}-column-${newCol}`;
                        const square = document.getElementById(squareId);
                        const targetPiece = square.querySelector('img:not(.overlay)');
                        
                        if (!targetPiece || targetPiece.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                            validSquares.push(squareId);
                        }
                    }
                }
            }
            break;

        case 'pion': // Pawn - special movement
            const direction = pieceColor === 'white' ? 1 : -1;
            const startRow = pieceColor === 'white' ? 2 : 7;
            
            // Forward move
            const forwardRow = rowNum;
            const forwardCol = colNum + direction;
            if (forwardCol >= 1 && forwardCol <= 8) {
                const forwardId = `row-${forwardRow}-column-${forwardCol}`;
                const forwardSquare = document.getElementById(forwardId);
                const forwardPiece = forwardSquare.querySelector('img:not(.overlay)');
                
                if (!forwardPiece) {
                    validSquares.push(forwardId);
                    
                    // Double move from starting position
                    if (colNum === startRow) {
                        const doubleCol = colNum + (2 * direction);
                        const doubleId = `row-${forwardRow}-column-${doubleCol}`;
                        const doubleSquare = document.getElementById(doubleId);
                        const doublePiece = doubleSquare.querySelector('img:not(.overlay)');
                        const betweenId = `row-${forwardRow}-column-${colNum + direction}`;
                        const betweenSquare = document.getElementById(betweenId);
                        const betweenPiece = betweenSquare.querySelector('img:not(.overlay)');
                        
                        if (!doublePiece && !betweenPiece) {
                            validSquares.push(doubleId);
                        }
                    }
                }
            }
            
            // Capture moves
            const captureRows = [rowNum - 1, rowNum + 1];
            const captureCol = colNum + direction;
            
            if (captureCol >= 1 && captureCol <= 8) {
                captureRows.forEach(r => {
                    if (r >= 1 && r <= 8) {
                        const captureId = `row-${r}-column-${captureCol}`;
                        const captureSquare = document.getElementById(captureId);
                        if (captureSquare) {
                            const capturePiece = captureSquare.querySelector('img:not(.overlay)');
                            if (capturePiece && capturePiece.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                                validSquares.push(captureId);
                            }
                        }
                    }
                });
            }
            break;
    }
    return validSquares;
}
(function() {
    // Capture the original functions (they are function-declared later and thus hoisted)
    const ORIGINAL_HIGHLIGHT = window.highlightValidMoves;
    const ORIGINAL_CLEAR = window.clearHighlights;

    // Analyze candidate moves: filter out moves that leave own king in check,
    // disallow king moves into attacked squares, and mark moves that give check.
    function analyzeMovesForPiece(piece, squareIds) {
        const pieceColor = piece.classList.contains('white') ? 'white' : 'black';
        const opponentColor = pieceColor === 'white' ? 'black' : 'white';
        const results = [];

        for (const id of squareIds) {
            // If the piece is the king, it cannot move into a square attacked by the opponent
            if (piece.classList.contains('raja')) {
                if (isSquareAttacked(id, opponentColor)) continue;
            }

            // Move must not leave own king in check
            const keepsKingSafe = simulateMoveAndCheck(piece, id, () => {
                return !isKingInCheck(pieceColor);
            });
            if (!keepsKingSafe) continue;

            // Determine whether this move would put the opponent's king in check
            const givesCheck = simulateMoveAndCheck(piece, id, () => {
                return isKingInCheck(opponentColor);
            });

            results.push({ id, givesCheck });
        }

        return results;
    }

    // Replace highlightValidMoves with one that waits for the analysis before painting.
    window.highlightValidMoves = function(squareIds) {
        const piece = draggedPiece;
        // If no piece is currently dragged, fall back to original behavior
        if (!piece) {
            ORIGINAL_HIGHLIGHT(squareIds);
            return;
        }

        const analyzed = analyzeMovesForPiece(piece, squareIds);
        const idsToShow = analyzed.map(r => r.id);

        // Paint the standard highlights for legal moves/captures
        ORIGINAL_HIGHLIGHT(idsToShow);

        // Add a distinct marker for moves that would give check (optional visual aid)
        analyzed.forEach(r => {
            if (r.givesCheck) {
                const sq = document.getElementById(r.id);
                if (sq) sq.classList.add('move-gives-check');
            }
        });
    };

    // Ensure clearHighlights removes our extra marker as well
    window.clearHighlights = function() {
        document.querySelectorAll('.move-gives-check').forEach(el => el.classList.remove('move-gives-check'));
        ORIGINAL_CLEAR();
    };
})();
function checkDirection(startRow, startCol, rowStep, colStep, validSquares, pieceColor) {
    let currentRow = startRow + rowStep;
    let currentCol = startCol + colStep;
    
    while (currentRow >= 1 && currentRow <= 8 && currentCol >= 1 && currentCol <= 8) {
        const squareId = `row-${currentRow}-column-${currentCol}`;
        const square = document.getElementById(squareId);
        const piece = square.querySelector('img:not(.overlay)');
        
        if (piece) {
            if (piece.classList.contains(pieceColor === 'white' ? 'black' : 'white')) {
                validSquares.push(squareId); // Can capture opponent
            }
            break; // Blocked by any piece
        }
        
        validSquares.push(squareId);
        currentRow += rowStep;
        currentCol += colStep;
    }
}

// UI functions
function highlightValidMoves(squareIds) {
    clearHighlights();
    
    squareIds.forEach(id => {
        const square = document.getElementById(id);
        if (square) {
            const existingPiece = square.querySelector('img:not(.overlay)');
            if (existingPiece) {
                square.classList.add('valid-capture');
            } else {
                square.classList.add('valid-move');
            }
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.valid-move, .valid-capture').forEach(square => {
        square.classList.remove('valid-move', 'valid-capture');
    });
}

function switchTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnIndicator();
    startTimer(); // Restart timer for new player
}

function updateTurnIndicator() {
    console.log(`Current turn: ${currentPlayer}`);
    // You can add visual indication of current player here
}

// Game state evaluation, win/draw detection and helpers
let gameOver = false;

function stopGame(result) {
    if (gameOver) return;
    gameOver = true;
    clearInterval(timerInterval);

    // Disable dragging
    document.querySelectorAll('img:not(.overlay)').forEach(p => p.draggable = false);

    if (result === 'draw') {
        alert('Game drawn!');
    } else {
        alert(`${result.charAt(0).toUpperCase() + result.slice(1)} wins!`);
    }
}

// Return true if the given color's king is currently under attack
function isKingInCheck(color) {
    const king = document.querySelector(`img.raja.${color}`);
    if (!king) return false; // if no king, treat as not in check (handled elsewhere)
    const kingSquareId = king.parentElement.id;
    const opponentColor = color === 'white' ? 'black' : 'white';
    const opponentPieces = Array.from(document.querySelectorAll(`img.${opponentColor}:not(.overlay)`));
    for (const op of opponentPieces) {
        const moves = calculateValidMoves(op, op.parentElement);
        if (moves.includes(kingSquareId)) return true;
    }
    return false;
}

// Simulate a move, call checkFn while board is in simulated state, then restore board
function simulateMoveAndCheck(piece, targetSquareId, checkFn) {
    const origParent = piece.parentElement;
    const origNext = piece.nextSibling;
    const targetSquare = document.getElementById(targetSquareId);
    if (!targetSquare) return false;

    const captured = targetSquare.querySelector('img:not(.overlay)');
    const overlay = targetSquare.querySelector('.overlay');

    // If target contains the same piece (moving to same square) it's a no-op
    const capturedIsSame = captured === piece;

    // Detach captured piece (if different)
    let capturedElem = null;
    if (captured && !capturedIsSame) {
        capturedElem = captured;
        capturedElem.remove();
    }

    // Move piece
    targetSquare.insertBefore(piece, overlay || null);

    // Perform check
    let result;
    try {
        result = checkFn();
    } catch (e) {
        result = false;
    }

    // Restore piece to original location
    if (piece.parentElement) piece.remove();
    if (origNext) origParent.insertBefore(piece, origNext);
    else origParent.appendChild(piece);

    // Restore captured piece if any
    if (capturedElem) {
        targetSquare.insertBefore(capturedElem, overlay || null);
    }

    return result;
}

// Returns number of legal moves available for color (considering check)
// Stops early when at least one legal move found
function countLegalMovesForPlayer(color) {
    const pieces = Array.from(document.querySelectorAll(`img.${color}:not(.overlay)`));
    for (const piece of pieces) {
        const moves = calculateValidMoves(piece, piece.parentElement);
        for (const targetId of moves) {
            const keepsKingSafe = simulateMoveAndCheck(piece, targetId, () => {
                // After the simulated move, the color's king must NOT be in check
                return !isKingInCheck(color);
            });
            if (keepsKingSafe) return 1; // at least one legal move exists
        }
    }
    return 0;
}
(function() {
    // Capture original alert so we can fall back if needed
    const originalAlert = window.alert.bind(window);
    const resultEl = document.getElementById('game-result');

    function renderResult(message) {
        if (!resultEl) {
            originalAlert(message);
            return;
        }
        resultEl.textContent = message;
        resultEl.classList.remove('hidden');
    }

    function clearResult() {
        if (!resultEl) return;
        resultEl.textContent = '';
        resultEl.classList.add('hidden');
    }

    // Replace global alert with a function that renders into #game-result.
    // Falls back to original alert if the element is missing.
    window.alert = function(message) {
        renderResult(String(message));
    };

    // Expose helpers in case other code wants to control the result box
    window.showGameResult = renderResult;
    window.clearGameResult = clearResult;

    // Ensure any new game initialization clears previous result text.
    if (typeof window.initGame === 'function') {
        const _initGame = window.initGame;
        window.initGame = function() {
            clearResult();
            return _initGame();
        };
    }
})();
function evaluateGameState() {
    if (gameOver) return;

    const whiteKing = document.querySelector('img.raja.white');
    const blackKing = document.querySelector('img.raja.black');

    // Immediate king capture win
    if (!whiteKing) {
        stopGame('black');
        return;
    }
    if (!blackKing) {
        stopGame('white');
        return;
    }

    // Insufficient material: only two kings remain -> draw
    const allPieces = Array.from(document.querySelectorAll('img:not(.overlay)'));
    if (allPieces.length === 2 &&
        allPieces.every(p => p.classList.contains('raja'))) {
        stopGame('draw');
        return;
    }

    // Check for stalemate / checkmate for the player who's about to move (currentPlayer)
    const playerHasMoves = countLegalMovesForPlayer(currentPlayer) > 0;
    const playerInCheck = isKingInCheck(currentPlayer);

    if (!playerHasMoves && playerInCheck) {
        // Checkmate: other player wins
        const winner = currentPlayer === 'white' ? 'black' : 'white';
        stopGame(winner);
        return;
    }

    if (!playerHasMoves && !playerInCheck) {
        // Stalemate -> draw
        stopGame('draw');
        return;
    }
}

// Observe board moves: evaluate after any drop (run after existing drop handler)
document.querySelectorAll('.column').forEach(square => {
    square.addEventListener('drop', () => {
        // Allow the original drop handler to finish and state to settle
        setTimeout(evaluateGameState, 0);
    });
});

// Also evaluate when timer runs out or on init
evaluateGameState();

// When a drag starts, filter the already-calculated validMoveSquares so that
// only moves that leave the king out of check remain. If none remain, cancel the drag.
// Return true if squareId is attacked by any piece of byColor
function isSquareAttacked(squareId, byColor) {
    const attackers = Array.from(document.querySelectorAll(`img.${byColor}:not(.overlay)`));
    for (const att of attackers) {
        const moves = calculateValidMoves(att, att.parentElement);
        if (moves.includes(squareId)) return true;
    }
    return false;
}

// After the original dragstart runs, filter the previously calculated validMoveSquares
// so only moves that leave the king safe remain. If none remain, cancel the drag.
document.addEventListener('dragstart', (evt) => {
    // run after existing handler has set draggedPiece and validMoveSquares
    setTimeout(() => {
        const piece = evt.target;
        if (!piece || piece.tagName !== 'IMG' || piece.classList.contains('overlay')) return;
        if (draggedPiece !== piece) return; // only operate on the current dragged piece

        const pieceColor = piece.classList.contains('white') ? 'white' : 'black';
        const opponentColor = pieceColor === 'white' ? 'black' : 'white';

        // Filter validMoveSquares to only those that keep the king safe after the move.
        const filtered = validMoveSquares.filter(targetId => {
            // Extra: king may not move into a square attacked by the opponent
            if (piece.classList.contains('raja')) {
                if (isSquareAttacked(targetId, opponentColor)) return false;
            }

            // Simulate the move and ensure the moving side's king is NOT left in check.
            return simulateMoveAndCheck(piece, targetId, () => {
                return !isKingInCheck(pieceColor);
            });
        });

        validMoveSquares = filtered;
        // Update highlights to show only legal moves
        highlightValidMoves(validMoveSquares);

        // If no legal moves remain, cancel the drag visually/semantically
        if (validMoveSquares.length === 0) {
            // Remove dragging state and clear selection so drop won't do anything
            piece.classList.remove('dragging');
            draggedPiece = null;
            clearHighlights();
        }
    }, 0);
});

(function() {
    // Debounce highlightValidMoves so only the last call within a short window actually paints.
    // This prevents the immediate (pre-check) highlight from flashing before legal-move filtering runs.
    const ORIGINAL_HIGHLIGHT = window.highlightValidMoves;
    const ORIGINAL_CLEAR = window.clearHighlights;
    let highlightTimer = null;
    const HIGHLIGHT_DELAY_MS = 40; // small delay to allow the post-dragstart filtering to run

    window.highlightValidMoves = function(squareIds) {
        if (highlightTimer) clearTimeout(highlightTimer);
        highlightTimer = setTimeout(() => {
            highlightTimer = null;
            ORIGINAL_HIGHLIGHT(squareIds);
        }, HIGHLIGHT_DELAY_MS);
    };

    // Ensure clearing highlights cancels any pending highlight
    window.clearHighlights = function() {
        if (highlightTimer) {
            clearTimeout(highlightTimer);
            highlightTimer = null;
        }
        ORIGINAL_CLEAR();
    };
})();



// Start the game
initGame();
updateTimers();
