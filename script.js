
function createPlayer(name, playerMarker, isBot = false){
    let score = 0;

    function increaseScore(){
        score += 1;
    };

    if (isBot) {
        const getBestMove = (board, currentPlayer, depth = 0) => {
            const availableMoves = getAvailableMoves(board);
    
            if (checkWin(board, 'X')) {
                return { score: -1 };
            } else if (checkWin(board, 'O')) {
                return { score: 1 };
            } else if (availableMoves.length === 0) {
                return { score: 0 };
            }
    
            const moves = [];
    
            for (const move of availableMoves) {
                const newBoard = makeMove(board, move, currentPlayer);
                const result = getBestMove(newBoard, currentPlayer === 'X' ? 'O' : 'X', depth + 1);
                moves.push({
                    move,
                    score: result.score
                });
            }

    
            return depth % 2 === 0
                ? moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity })
                : moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
        };
    
        const makeMove = (board, move, player) => {
            const newBoard = board.map(row => [...row]);
            const row = Math.floor(move / newBoard.length);
            const col = move % newBoard.length;
    
            if (newBoard[row][col] === '') {
                newBoard[row][col] = player;
            }
    
            return newBoard;
        };
    
        const getAvailableMoves = (board) => {
            return board.reduce((moves, row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell === '') {
                        moves.push(rowIndex * board.length + colIndex);
                    }
                });
                return moves;
            }, []);
        };
    
        const checkWin = (board, player) => {
            const winningConditions = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
    
            return winningConditions.some((condition) => {
                return condition.every((index) => {
                    const row = Math.floor(index / board.length);
                    const col = index % board.length;
                    return board[row][col] === player;
                });
            });
        };
    
        return { name, playerMarker, score, getBestMove, increaseScore };
    };

    return {name, playerMarker, score, increaseScore };
};

const Board = (() => {
    const boardSize = 3;
    const DOMBoardCache = {}
    for (let i = 1; i <= boardSize * boardSize; i++){
        DOMBoardCache[`cell-${i}`] = document.querySelector(`.cells[cell-index="${i}"]`);
    }

    const gameBoard = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]

    const addMarker = (marker, cellIndex) => {
        if (!isNaN(cellIndex) && DOMBoardCache[`cell-${cellIndex}`].innerHTML === ''){
            DOMBoardCache[`cell-${cellIndex}`].innerHTML = marker;
            const row = Math.floor((cellIndex - 1) / boardSize);
            const col = (cellIndex - 1) % boardSize;
            gameBoard[row][col] = marker;
        }
    };
    
    return { DOMBoardCache, addMarker, gameBoard };
})();

const GameController = (() => {
    const statusModal = document.querySelector('#show-winner');
    const winnerHeading = document.querySelector('#show-winner > h1');
    const winningConditions = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7], 
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9], 
        [3, 5, 7],
    ];
    let noTies = 0;

    function checkWin(cellIndex, playerMarker, DOMBoardCache){
        let isWin;
        
        for (let i = 0; i < winningConditions.length; i++){
            if (winningConditions[i].includes(parseInt(cellIndex))){
                isWin = true;
                for (let j = 0; j < winningConditions[i].length; j++) {
                    const index = winningConditions[i][j];
                    if (DOMBoardCache[`cell-${index}`].innerHTML !== playerMarker) {
                        isWin = false;
                        break;
                    }
                }
            }
            if (isWin)
                break;
        }
        return isWin;
    }

    function makeMove(player, cellIndex){
        let gameBoardFull = true;

        Board.addMarker(player.playerMarker, cellIndex);
        Object.values(Board.DOMBoardCache).forEach(cell => {
            if (cell.innerHTML === '') 
                gameBoardFull = false;
        });

        let roundResult = checkWin(cellIndex, player.playerMarker, Board.DOMBoardCache);

        if (gameBoardFull && !roundResult){
            noTies++;
            announceWinner('Draw!');
        }
        
        return roundResult;
    }

    function announceWinner(headingMessage){
        winnerHeading.innerHTML = headingMessage;
        statusModal.style.display = 'flex';
        statusModal.showModal();
    }

    function playMove(player, cellIndex){
        let roundResult = makeMove(player, cellIndex);
        
        if (roundResult) {
            announceWinner(`${player.name} wins!`);
            player.score++;
        }
    };

    function getNoTies(){
        return noTies;
    }

    return { playMove, getNoTies };
})();

(function initialSetup(){
    const doublePlayerMode = document.getElementById('double-player');
    const singlePlayerMode = document.getElementById('single-player');
    const modal = document.querySelector('[data-modal]');
    const gamePlay = document.querySelector('#start-game');
    let isBot = false;

    singlePlayerMode.addEventListener('click', () => {
        const gameSetUp = document.querySelector('.game-setup');
        const player2NameInput = document.querySelector('#player-2-name');

        player2NameInput.style.display = 'none';
        gameSetUp.style.display = 'none';
        modal.showModal();
        modal.style.display = 'flex';
        isBot = true;
    });
    

    doublePlayerMode.addEventListener('click', () => {
        const gameSetUp = document.querySelector('.game-setup');

        gameSetUp.style.display = 'none';
        modal.showModal();
        modal.style.display = 'flex';
    });

    gamePlay.addEventListener('click', () => {
        const gameCells = document.querySelectorAll('.cells');
        const playAgain = document.querySelector('#repeat');
        const endGame = document.querySelector('#end-game');
        const game = Board;
        const controller = GameController;
        let currentPlayer = 'player1';
        let isBotFirst = true;
       
        function changeScore(){
            const player1Score = document.querySelector('#player-1-score');
            const player2Score = document.querySelector('#player-2-score');
            const drawScore = document.querySelector('#draw-score');

            drawScore.innerHTML = `Ties: ${controller.getNoTies()}`;
            player1Score.innerHTML = `${players.player1.name}: ${players.player1.score}`;
            player2Score.innerHTML = `${players.player2.name}: ${players.player2.score}`;
        }

        playAgain.addEventListener('click', () => {
            const statusModal = document.querySelector('#show-winner');

            Object.values(game.DOMBoardCache).forEach(cell => {
                cell.innerHTML = '';
            });

            for (let i = 0; i < game.gameBoard.length; i++){
                for (let j = 0; j < game.gameBoard[i].length; j++){
                    game.gameBoard[i][j] = '';
                }
            }

            changeScore();
            statusModal.style.display = 'none';
            statusModal.close();

            if (isBot){
                if (isBotFirst){
                    let cellIndex = players.player2.getBestMove(game.gameBoard, players.player2.playerMarker);
                    
                    controller.playMove(players['player2'], cellIndex.move + 1);
                    isBotFirst = false
                } else {
                    isBotFirst = true;
                }
            }
        });

        endGame.addEventListener('click', () => {
            location.reload();
        });

        const players = (function addPlayers(){
            let player1Name = document.querySelector('#player-1-name').value;
            let player1;
            let player2;

            if (player1Name === '')
                    player1Name = 'Player-X';
            player1 = createPlayer(player1Name, 'X');

            if (isBot){
                player2 = createPlayer('AI Bot', 'O', true);
            } else {
                let player2Name = document.querySelector('#player-2-name').value;

                if (player2Name === '')
                    player2Name = 'Player-O';
                player2 = createPlayer(player2Name, 'O');
            }

            return { player1, player2 };

        })();

        changeScore();

        (function displayBoard() {
            const gameContainer = document.querySelector('.game-container');

            modal.style.display = 'none';
            modal.close();
            gameContainer.style.display = 'block';
        })();

        let isPlayer1 = true;
        gameCells.forEach(cell => {
            cell.addEventListener('click', () => {
                controller.playMove(players[currentPlayer], cell.getAttribute('cell-index'));
                
                if (isBot){
                    let cellIndex = players.player2.getBestMove(game.gameBoard, players.player2.playerMarker);
                    
                    controller.playMove(players['player2'], cellIndex.move + 1);
                }

                if (!isBot && isPlayer1) {    
                    isPlayer1 = false;
                    currentPlayer = 'player2';
                } else {
                    isPlayer1 = true;
                    currentPlayer = 'player1';
                }
            });
        });

    });

})();
