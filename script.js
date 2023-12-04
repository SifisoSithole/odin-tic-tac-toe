
function createPlayer(name, playerMarker){
    let score = 0;

    function increaseScore(){
        score += 1;
    };

    return {name, playerMarker, score, increaseScore };
};

const Board = (() => {
    const boardSize = 3;
    const DOMBoardCache = {}
    for (let i = 1; i <= boardSize * boardSize; i++){
        DOMBoardCache[`cell-${i}`] = document.querySelector(`.cells[cell-index="${i}"]`);
    }

    const addMarker = (marker, cellIndex) => {
        DOMBoardCache[`cell-${cellIndex}`].innerHTML = marker;
    };
    
    return {DOMBoardCache, addMarker};
})();

const GameController = (() => {
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
            if (isWin){
                break;
            }
        }
        return isWin;
    }

    return { checkWin };

})();

(function initialSetup(){
    const doublePlayerMode = document.getElementById('double-player');
    const modal = document.querySelector('[data-modal]');
    const gamePlay = document.querySelector('#start-game');
    

    doublePlayerMode.addEventListener('click', () => {
        const gameSetUp = document.querySelector('.game-setup');

        gameSetUp.style.display = 'none';
        modal.showModal();
        modal.style.display = 'flex';
    });

    gamePlay.addEventListener('click', () => {
        const gameCells = document.querySelectorAll('.cells');
        const statusModal = document.querySelector('#show-winner');
        const winnerHeading = document.querySelector('#show-winner > h1');
        const playAgain = document.querySelector('#repeat');
        const endGame = document.querySelector('#end-game');
        const game = Board;
        const controller = GameController;
        let currentPlayer = 'player1';
        let noTies = 0;
       

        function changeScore(){
            const player1Score = document.querySelector('#player-1-score');
            const player2Score = document.querySelector('#player-2-score');
            const drawScore = document.querySelector('#draw-score');

            drawScore.innerHTML = `Ties: ${noTies}`;
            player1Score.innerHTML = `${players.player1.name}: ${players.player1.score}`;
            player2Score.innerHTML = `${players.player2.name}: ${players.player2.score}`;
        }

        playAgain.addEventListener('click', () => {

            Object.values(game.DOMBoardCache).forEach(cell => {
                cell.innerHTML = '';
            });

            changeScore();
            statusModal.style.display = 'none';
            statusModal.close();
        })

        endGame.addEventListener('click', () => {
            location.reload();
        });

        const players = (function addPlayers(){
            let player1Name = document.querySelector('#player-1-name').value;
            let player2Name = document.querySelector('#player-2-name').value;
            const player1Score = document.querySelector('#player-1-score');
            const player2Score = document.querySelector('#player-2-score');

            if (player1Name === '')
                player1Name = 'Player-X';

            if (player2Name === '')
                player2Name = 'Player-O';

            const player1 = createPlayer(player1Name, 'X');
            const player2 = createPlayer(player2Name, 'O');

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
                const cellIndex = cell.getAttribute('cell-index');
                let gameBoardFull = true;

                game.addMarker(players[currentPlayer].playerMarker, cellIndex);
                let roundResult = GameController.checkWin(cellIndex, players[currentPlayer].playerMarker, game.DOMBoardCache);

                Object.values(game.DOMBoardCache).forEach(cell => {
                   if (cell.innerHTML === '') 
                        gameBoardFull = false;
                });

                if (gameBoardFull){
                    winnerHeading.innerHTML = 'Draw!';
                    statusModal.style.display = 'flex';
                    statusModal.showModal();

                    noTies++;
                }
                
                if (roundResult) {
                    winnerHeading.innerHTML = `${players[currentPlayer].name} wins!`;
                    players[currentPlayer].score++;
                    statusModal.style.display = 'flex';
                    statusModal.showModal();
                }

                if (isPlayer1){    
                    isPlayer1 = false;
                    currentPlayer = 'player2';
                } else {
                    isPlayer1 = true;
                    currentPlayer = 'player1';
                }
            })
        });

    });

})();
