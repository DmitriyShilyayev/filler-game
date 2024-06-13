'use strict';
const $ = jQuery;

const domContainer = document.querySelector('#app');
const root = ReactDOM.createRoot(domContainer);

class Game extends React.Component {
    constructor() {
        super();

        this.state = { gameStarted: false, gameObject: [] };
    }

    startGame() {
        if (!this.state.gameObject.length) {
            $('body').addClass('loading');
            $.ajax(document.location.origin + '/media/taskslist.json')
                .done((result) => {
                    this.setState({ gameObject: result, gameStarted: true });
                })
                .always(() => {
                    $('body').removeClass('loading');
                });
        } else {
            this.setState({ gameStarted: true });
        }
    }

    stopGame() {
        this.setState({ gameStarted: false });
    }

    render() {
        if (this.state.gameStarted) {
            return (
                <GameScreen
                    gameObject={this.state.gameObject}
                    stopGame={this.stopGame.bind(this)}
                ></GameScreen>
            );
        } else {
            return (
                <StartScreen
                    clickHandler={this.startGame.bind(this)}
                ></StartScreen>
            );
        }
    }
}

class GameScreen extends React.Component {
    constructor(props) {
        super(props);

        let levelString = this.props.gameObject[0].answer;
        this.props.gameObject[0].tasks.forEach((item) => {
            levelString += item.answer;
        });
        levelString = levelString.replace(/\s/g, '').toUpperCase();
        let levelArray = Array.from(new Set(levelString.split('')));

        this.state = {
            currentLevel: 0,
            levelPassed: false,
            gameFinished: false,
            levelLettersArray: levelArray,
            playerInputArray: Array(levelArray.length).fill(''),
        };
    }

    loadLevel(levelNumber) {
        let levelString = '';
        levelString += this.props.gameObject[levelNumber].answer;
        this.props.gameObject[levelNumber].tasks.forEach((item) => {
            levelString += item.answer;
        });
        levelString = levelString.replace(/\s/g, '').toUpperCase();
        let levelArray = Array.from(new Set(levelString.split('')));

        this.setState({
            levelLettersArray: levelArray,
            playerInputArray: Array(levelArray.length).fill(''),
        });
    }

    checkLevel(secondArray) {
        let firstArray = this.state.levelLettersArray;
        for (let i = 0; i < firstArray.length; ++i) {
            if (firstArray[i] !== secondArray[i]) return false;
        }
        this.setState({ levelPassed: true });
    }

    nextLevel() {
        let levelNumber = this.state.currentLevel;
        if (levelNumber < this.props.gameObject.length - 1) {
            levelNumber++;
            this.setState({
                currentLevel: levelNumber,
                levelPassed: false,
            });
            this.loadLevel(levelNumber);
        } else {
            this.setState({ gameFinished: true });
        }
    }

    setLetter(index, value) {
        let lettersArray = [...this.state.playerInputArray];
        lettersArray[index] = value.toUpperCase();
        this.setState({ playerInputArray: lettersArray });
        this.checkLevel(lettersArray);
    }

    render() {
        let attr = {};
        if (!this.state.levelPassed) {
            attr['disabled'] = true;
        }
        if (this.state.gameFinished) {
            attr['style'] = { display: 'none' };
        }
        return (
            <div className="game-screen">
                <AnswerScreen
                    stringToRender={
                        this.props.gameObject[this.state.currentLevel].answer
                    }
                    playerInputArray={this.state.playerInputArray}
                    levelLettersArray={this.state.levelLettersArray}
                ></AnswerScreen>
                <InputScreen
                    setLetter={this.setLetter.bind(this)}
                    tasks={this.props.gameObject[this.state.currentLevel].tasks}
                    playerInputArray={this.state.playerInputArray}
                    levelLettersArray={this.state.levelLettersArray}
                ></InputScreen>
                <div className="game-controls">
                    <button onClick={this.nextLevel.bind(this)} {...attr}>
                        Next Level
                    </button>
                    <button onClick={this.props.stopGame}>Stop</button>
                </div>
            </div>
        );
    }
}

function StartScreen(props) {
    return (
        <div className="start-screen">
            <h1>Welcome to the Game!</h1>
            <button className="button" onClick={props.clickHandler}>
                Start
            </button>
        </div>
    );
}

function AnswerScreen(props) {
    return (
        <div className="answer-screen">
            <RenderString
                string={props.stringToRender}
                lettersDisabled={true}
                playerInputArray={props.playerInputArray}
                levelLettersArray={props.levelLettersArray}
            ></RenderString>
        </div>
    );
}

function InputScreen(props) {
    let itemsList = [];
    props.tasks.forEach((item, index) => {
        itemsList.push(
            <li className="questions-list-item" key={index}>
                <div className="question-string">
                    <p>{item.question}</p>
                </div>
                <div className="question-answer">
                    <RenderString
                        string={item.answer}
                        lettersDisabled={false}
                        inputHandler={props.setLetter}
                        playerInputArray={props.playerInputArray}
                        levelLettersArray={props.levelLettersArray}
                        key={index}
                    ></RenderString>
                </div>
            </li>
        );
    });
    return (
        <div className="input-screen">
            <ul className="questions-list">{itemsList}</ul>
        </div>
    );
}

function RenderString(props) {
    let lettersList = props.string.toUpperCase().split('');
    let renderedLettersList = [];
    lettersList.forEach((item, index) => {
        renderedLettersList.push(
            <RenderLetter
                letter={item}
                lettersDisabled={props.lettersDisabled}
                inputHandler={props.inputHandler}
                playerInputArray={props.playerInputArray}
                levelLettersArray={props.levelLettersArray}
                key={index}
            ></RenderLetter>
        );
    });

    return <div className="string-wrapper">{renderedLettersList}</div>;
}

function RenderLetter(props) {
    let letterIndex = props.levelLettersArray.indexOf(props.letter);
    if (props.letter === ' ') {
        return <div className="letter-input-wrapper"></div>;
    } else {
        if (props.lettersDisabled) {
            return (
                <div className="letter-input-wrapper">
                    <input
                        type="text"
                        className="letter-input"
                        disabled
                        value={props.playerInputArray[letterIndex]}
                    ></input>
                    <label>{letterIndex + 1}</label>
                </div>
            );
        } else {
            return (
                <div className="letter-input-wrapper">
                    <input
                        type="text"
                        className="letter-input"
                        onChange={(event) => {
                            props.inputHandler(letterIndex, event.target.value);
                        }}
                        value={props.playerInputArray[letterIndex]}
                        maxLength="1"
                    ></input>
                    <label>{letterIndex + 1}</label>
                </div>
            );
        }
    }
}

root.render(React.createElement(Game));
