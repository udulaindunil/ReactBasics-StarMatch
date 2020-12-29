import React, {useEffect, useState} from 'react';

const PlayNumber = ({number, status, onButtonClick}) => {

    return (
        <button
            className="number"
            style={{backgroundColor: colors[status]}}
            onClick={() => {
                onButtonClick(number, status)
            }}
        >
            {number}
        </button>
    )
};


const StarsDisplay = ({stars}) => {

    return (
        <>
            {utils.range(1, stars).map(starID =>
                <div key={starID} className="star"/>
            )}
        </>
    )
};

const PlayAgain = ({resetGame, gameStatus}) => {
    return (
        <>
            <div className="game-done">
                <div
                    className="message"
                    style={{color: gameStatus === 'lost' ? 'red' : 'green'}}
                >
                    {
                        gameStatus === 'lost' ? 'Game Over ' : 'Nice'
                    }
                </div>
                <button onClick={resetGame}>
                    Play Again
                </button>
            </div>
        </>
    )
};

const useGameState = () => {
    const [stars, setStars] = useState(utils.random(1, 9));
    const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
    const [candidateNums, setCandidateNums] = useState([]);
    const [secondLeft, setSecondLeft] = useState(10);

    useEffect(() => {
        if (secondLeft > 0 && availableNums.length !== 0) {
            const timerID = setTimeout(() => {
                setSecondLeft(secondLeft - 1);
            }, 1000);
            return () => clearTimeout(timerID);
        }
    });

    const setGameState = (newCandidateNums) => {
        if (utils.sum(newCandidateNums) !== stars) {
            setCandidateNums(newCandidateNums);
        } else {
            const newAvailableNums = availableNums.filter(
                n => !newCandidateNums.includes(n)
            );

            setStars(utils.randomSumIn(newAvailableNums, 9))
            setAvailableNums(newAvailableNums);
            setCandidateNums([]);
        }

    };

    return {stars, availableNums, candidateNums, secondLeft, setGameState}
};



const Game = ({startNewGame}) => {

    const {stars, availableNums, candidateNums, secondLeft, setGameState} =  useGameState();


    const candidatesAreWrong = utils.sum(candidateNums) > stars;
    const gameStatus = availableNums.length === 0 ? 'won' : secondLeft === 0 ? 'lost' : 'active';


    const numberStatus = (number) => {
        if (!availableNums.includes(number)) {
            return 'used'
        }
        if (candidateNums.includes(number)) {
            return candidatesAreWrong ? 'wrong' : 'candidate';
        }
        return 'available'
    };


    const onNumberClick = (number, currentStatus) => {
        if (gameStatus !== 'active' || currentStatus === 'used') {
            return;
        }
        const newCandidateNums =
            currentStatus === 'available' ?
                candidateNums.concat(number) : candidateNums.filter(cn => cn !== number);

        setGameState(newCandidateNums);

    };

    return (
        <div className="game">
            <div className="help">
                Pick 1 or more numbers that sum to the number of stars
            </div>
            <div className="body">
                <div className="left">

                    {gameStatus !== 'active' ?
                        (<PlayAgain resetGame={startNewGame} gameStatus={gameStatus}/>) :
                        (<StarsDisplay stars={stars}/>
                        )}


                </div>
                <div className="right">
                    {
                        utils.range(1, 9).map(starID =>
                            <PlayNumber
                                key={starID}
                                number={starID}
                                status={numberStatus(starID)}
                                onButtonClick={onNumberClick}
                            />
                        )
                    }
                </div>
            </div>
            <div className="timer">Time Remaining: {secondLeft}</div>
        </div>
    );
};

const StarMatch = () => {
    const [gameID, setGameID] = useState(1);
    return <Game key={gameID} startNewGame={() => {
        setGameID(gameID + 1)
    }}/>

};

// Color Theme
const colors = {
    available: 'lightgray',
    used: 'lightgreen',
    wrong: 'lightcoral',
    candidate: 'deepskyblue',
};

// Math science
const utils = {
    // Sum an array
    sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

    // create an array of numbers between min and max (edges included)
    range: (min, max) => Array.from({length: max - min + 1}, (_, i) => min + i),

    // pick a random number between min and max (edges included)
    random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

    // Given an array of numbers and a max...
    // Pick a random sum (< max) from the set of all available sums in arr
    randomSumIn: (arr, max) => {
        const sets = [[]];
        const sums = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0, len = sets.length; j < len; j++) {
                const candidateSet = sets[j].concat(arr[i]);
                const candidateSum = utils.sum(candidateSet);
                if (candidateSum <= max) {
                    sets.push(candidateSet);
                    sums.push(candidateSum);
                }
            }
        }
        return sums[utils.random(0, sums.length - 1)];
    },
};

export default StarMatch