
function createPlayer(name, playerMarker){
    const score = 0;
    return {name, playerMarker, score};
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
        let currentPlayer = 'player1';
        const game = Board;
        const controller = GameController;
        const players = (function addPlayers(){
            const player1Name = document.querySelector('#player-1-name');
            const player2Name = document.querySelector('#player-2-name');

            const player1 = createPlayer(player1Name, 'X');
            const player2 = createPlayer(player2Name, 'O');

            return { player1, player2 };
        })();

        let isPlayer1 = true;
        gameCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const cellIndex = cell.getAttribute('cell-index');
                let roundResult;

                game.addMarker(players[currentPlayer].playerMarker, cellIndex);
                roundResult = GameController.checkWin(cellIndex, players[currentPlayer].playerMarker, game.DOMBoardCache)
                
                if (roundResult){
                    console.log('Win');
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

        (function displayBoard(){
            const gameContainer = document.querySelector('.game-container');

            modal.style.display = 'none';
            modal.close();
            gameContainer.style.display = 'grid';
        })();



    });

})();
