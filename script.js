$(document).ready(function() {
    const boardWidth = 10;
    const boardHeight = 20;
    const blockSize = 20;
    let board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
    let currentBlock = null;
    let currentX = 0;
    let currentY = 0;
    let score = 0;
    let highestScore = localStorage.getItem('highestScore') || 0;
    let gameInterval;
    $('#play').click(function() {
        var audio = document.getElementById('hit-sound');
        if (audio.paused) {
            audio.play();
            $(this).text('Pause Song');
        } else {
            audio.pause();
            $(this).text('Play Song');
        }
    });
    $('#highest-score').text(highestScore);

    const tetrominoes = {
        I: [[1, 1, 1, 1]],
        O: [[1, 1], [1, 1]],
        T: [[0, 1, 0], [1, 1, 1]],
        S: [[0, 1, 1], [1, 1, 0]],
        Z: [[1, 1, 0], [0, 1, 1]],
        J: [[1, 0, 0], [1, 1, 1]],
        L: [[0, 0, 1], [1, 1, 1]]
    };

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function drawBoard() {
        $('#game-board').empty();
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                if (board[y][x]) {
                    $('<div/>').addClass('block').css({
                        top: y * blockSize,
                        left: x * blockSize,
                        backgroundColor: board[y][x]
                    }).appendTo('#game-board');
                }
            }
        }
    }

    function drawBlock() {
        currentBlock.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    $('<div/>').addClass('block').css({
                        top: (currentY + dy) * blockSize,
                        left: (currentX + dx) * blockSize,
                        backgroundColor: currentBlock.color
                    }).appendTo('#game-board');
                }
            });
        });
    }

    function isValidMove(offsetX, offsetY, newShape = currentBlock.shape) {
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                if (newShape[y][x]) {
                    let newX = currentX + x + offsetX;
                    let newY = currentY + y + offsetY;
                    if (newX < 0 || newX >= boardWidth || newY >= boardHeight || board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function moveBlock(dx, dy) {
        if (isValidMove(dx, dy)) {
            currentX += dx;
            currentY += dy;
            // playSound('move-sound');
            drawBoard();
            drawBlock();
        } else if (dy === 1) {
            playSound('move-sound');
            placeBlock();
            clearLines();
            if (currentY === 0) {
                gameOver();
            } else {
                spawnBlock();
            }
        }
    }

    function rotateBlock() {
        const newShape = currentBlock.shape[0].map((_, index) =>
            currentBlock.shape.map(row => row[index]).reverse()
        );
        if (isValidMove(0, 0, newShape)) {
            currentBlock.shape = newShape;
            drawBoard();
            drawBlock();
        }
    }

    function placeBlock() {
        currentBlock.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    board[currentY + dy][currentX + dx] = currentBlock.color;
                }
            });
        });
        // playSound('hit-sound');
    }

    function clearLines() {
        for (let y = boardHeight - 1; y >= 0; y--) {
            if (board[y].every(cell => cell)) {
                board.splice(y, 1);
                board.unshift(Array(boardWidth).fill(0));
                score += 100;
                $('#current-score').text(score);
                if (score > highestScore) {
                    highestScore = score;
                    localStorage.setItem('highestScore', highestScore);
                    $('#highest-score').text(highestScore);
                }
                y++;
            }
        }
    }

    function spawnBlock() {
        const shapes = Object.values(tetrominoes);
        currentBlock = { shape: shapes[Math.floor(Math.random() * shapes.length)], color: getRandomColor() };
        currentX = Math.floor(boardWidth / 2) - Math.floor(currentBlock.shape[0].length / 2);
        currentY = 0;
        if (!isValidMove(0, 0)) {
            gameOver();
        }
    }

    function gameOver() {
        clearInterval(gameInterval);
        alert('Game Over! Your score: ' + score);
    }

    function playSound(id) {
        const sound = document.getElementById(id);
        sound.currentTime = 0;
        sound.play();
    }

    $(document).keydown(function(e) {
        if (e.key === 'ArrowLeft') moveBlock(-1, 0);
        if (e.key === 'ArrowRight') moveBlock(1, 0);
        if (e.key === 'ArrowDown') moveBlock(0, 1);
        if (e.key === ' ') rotateBlock();
    });

    function startGame() {
        score = 0;
        $('#current-score').text(score);
        board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
        spawnBlock();
        gameInterval = setInterval(() => moveBlock(0, 1), 500);
    }

    startGame();
});
