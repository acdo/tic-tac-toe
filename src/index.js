import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    if (props.win) {
        return (
            <button className="square winSquare" onClick={props.onClick}>
                {props.value}
            </button>
        );
    } else {
        return (
            <button className="square" onClick={props.onClick}>
                {props.value}
            </button>
        );
    }
}

class Board extends React.Component {
    renderSquare(i, win) {
        return (<Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            win = {win}/>
        );
    }

    render() {
        const items = []
        if (this.props.line) {
            for (let row = 0; row < 3; ++row) {
                items.push(<div className="board-row">
                    {this.renderSquare(row * 3, this.props.line.includes(row * 3))}
                    {this.renderSquare(row * 3 + 1, this.props.line.includes(row * 3 + 1))}
                    {this.renderSquare(row * 3 + 2, this.props.line.includes(row * 3 + 2))}
                </div>);
            }
        } else {
            for (let row = 0; row < 3; ++row) {
                items.push(<div className="board-row">
                    {this.renderSquare(row * 3, false)}
                    {this.renderSquare(row * 3 + 1, false)}
                    {this.renderSquare(row * 3 + 2, false)}
                </div>);
            }
        }

        return (
            <div>
                {items}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                moveLoc: -1,
            }],
            stepNumber: 0,
            xIsNext: true,
            sortDesc: true,
        };
    }

    handleClick(i) {
        // Check if a move can be made
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[this.state.stepNumber];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        // Change the square value accordingly
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                moveLoc: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        // Determine if the game is in a won state
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {

            // Populate button text depending on what current board position is and if it is starting position or not
            const desc = move ?
                (move === this.state.stepNumber) ?
                    'Currently at move #' + move :
                    'Go to move #' + move :
                (move === this.state.stepNumber) ?
                    'Currently at game start' :
                    'Go to game start';

            // Determine location that X/O was placed on a given move
            const loc = move ?
                'Placed ' + (move % 2 === 0 ? 'O' : 'X') + ' at (' + Math.floor((move - 1) / 3) + ', ' + (move - 1) % 3 + ')' :
                '';

            if (move === this.state.stepNumber) {
                return (
                        <li key={move}>
                            <button onClick={() => this.jumpTo(move)}>
                                <b>
                                    {desc}
                                    <br/>
                                    {loc}
                                </b>
                            </button>
                        </li>
                );
            } else {
                return (
                        <li key={move}>
                            <button onClick={() => this.jumpTo(move)}>
                                {desc}
                                <br/>
                                {loc}
                            </button>
                        </li>
                );
            }
        });

        // Set message to won message or to display which player has the next move
        let status;
        let line;
        if (winner) {
            status = 'Winner: ' + winner.player;
            if (winner.line !== null) {
                line = winner.line;
            }
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        let locDesc = 'Move locations are in zero-indexed format (row, column)';

        const sort = this.state.sortDesc ?
            'Sort moves in ascending order' :
            'Sort moves in descending order';

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        line={line}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{locDesc}</div>
                    <button onClick={() => this.setState({sortDesc: !this.state.sortDesc})}>
                        {sort}
                    </button>
                    <ol>{this.state.sortDesc ? moves : moves.reverse()}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    let draw;

    for (let i = 0; i < lines.length; ++i) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {line: lines[i], player: squares[a]};
        }
    }

    for (let i = 0; i < 9; ++i) {
        if (!squares[i]) {
            draw = false;
        }
    }

    return draw === false ? null : {line: null, player: 'Draw'};
}