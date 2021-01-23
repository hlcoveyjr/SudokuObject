/******************************************************************************
 * Sudoku.js                                      author:  Harvey L. Covey, Jr.
 * Object-oriented sudoku application             created: Jan 19, 2021
 *****************************************************************************/
//#region GLOBALS
//#############################################################################
/* useMyOwnCss permits the ability to override built-in css
 *****************************************************************************/
let useMyOwnCss = false;
let verboseLogs = false;
/******************************************************************************
 * expected is an array representing the default 1-9 values for standard Sudoku
 *****************************************************************************/
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
/******************************************************************************
 * emptyBoard is a two-dimentional, 9x9 integer array of zeroes.
 *****************************************************************************/
const emptyBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];
/******************************************************************************
 * boxCoords defaults to the 3x3x3 standard configuration of a 9x9 Sudoku grid.
 * setting this to a non-standard layout changes the borders to match the new
 * layout.
 *****************************************************************************/
let boxCoords = [
    [1, 1, 1, 2, 2, 2, 3, 3, 3],
    [1, 1, 1, 2, 2, 2, 3, 3, 3],
    [1, 1, 1, 2, 2, 2, 3, 3, 3],
    [4, 4, 4, 5, 5, 5, 6, 6, 6],
    [4, 4, 4, 5, 5, 5, 6, 6, 6],
    [4, 4, 4, 5, 5, 5, 6, 6, 6],
    [7, 7, 7, 8, 8, 8, 9, 9, 9],
    [7, 7, 7, 8, 8, 8, 9, 9, 9],
    [7, 7, 7, 8, 8, 8, 9, 9, 9]
]
//#############################################################################
//#endregion GLOBALS

//#region ENUMS
//#############################################################################
const RenderStyle = { "DIV": 1, "TABLE": 2 };
const Section = { "ROW": 1, "COLUMN": 2, "BOX": 3 };
//#############################################################################
//#endregion ENUMS

//#region PROTOTYPES
//#############################################################################
/* Prototype: Array.clear
 * Returns an array to empty.
 *****************************************************************************/
Array.prototype.clear = function () {
    this.splice(0, this.length);
}

/******************************************************************************
 * Prototype: Number.pad
 * Left-pads the number with zeroes (0) and returns a string to the given size.
 * @param {any} size
 *****************************************************************************/
Number.prototype.pad = function (size) {
    let s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

/******************************************************************************
 * Prototype: Number.clip
 * Converts the number to a string and clips it to the given size. If the
 * string length is greater than the provided size, clips it to size - 3 and
 * appends an ellipses (...) to fit the size parameter.
 * @param {any} size
 *****************************************************************************/
Number.prototype.clip = function (size) {
    return String(this).clip(size);
}

/******************************************************************************
 * Prototype: Number.hideZero
 * Converts the number to a string and returns emptystring ("") is the number
 * is a zero (0) or the string itself.
 *****************************************************************************/
Number.prototype.hideZero = function () {
    let s = String(this);
    return s === "0" ? "" : s;
}

/******************************************************************************
 * Prototype: Sting.clip
 * Clips a string to the given size. If the string length is greater than the 
 * provided size, clips it to size - 3 and appends an ellipses (...) to fit
 * the size parameter.
 *****************************************************************************/
String.prototype.clip = function (size) {
    let s = String(this);
    return s.length > size ? `${s.substring(0, (size - 3))}...` : s.substring(0, size);
}

/******************************************************************************
 * Prototype: String.pad
 * Right-pads the string with the provided padString or a space (" ") if 
 * padString is not provided and returns a string to the given size.
 * @param {any} size
 * @param {any} padString
*****************************************************************************/
String.prototype.pad = function (size, padString) {
    let s = String(this);
    let pad = setOrDefault(padString, " ");
    while (s.length < (size || 2)) { s += pad; }
    return s;
}
//#############################################################################
//#endregion PROTOTYPES

//#region HELPER METHODS
//#############################################################################
/* Helper Method: checkForCss
 * Checks to see if a CSS element with the ID cssSudoku exists or the parameter
 * useMyOwnCss is set to true. If both of these conditions are false, creates
 * the element and appends it to the <head> of the document.
 *****************************************************************************/
function checkForCss() {
    var elem = setOrDefault(document.getElementById("cssSudoku"), false);
    if (!useMyOwnCss && !elem) {
        console.log("Using built-in CSS styling");
        let css = document.createElement('style');
        css.id = "cssSudoku"
        css.type = "text/css";
        css.innerHTML = `
        .grid { display: table; border: 2px black solid; }
        .row { display: table-row; border: none; }
        .cell {
            display: table-cell;
            border: 1px gray solid;
            width: 3rem;
            height: 3rem;
            max-width: 3rem;
            max-height: 3rem;
        }
        .cell input {
            width: 3rem;
            height: 3rem;
            padding: 0;
            margin: 0;
            border: none;
            text-align: center;
            vertical-align: middle;
            font-size: 2rem;
            color: blue;
        }
        .given input { color: black; }
        .box-right { border-right: 2px black solid; }
        .box-bottom { border-bottom: 2px black solid; }
        .noBorder { border: none; border-collapse: collapse; }
        `;
        document.querySelector("head").appendChild(css);
    }
}
/******************************************************************************
 * Helper method: setOrDefault
 * Checks to ensure the object passed is not null or undefined.
 * If not, it returns the provided parameter object (o).
 * if so, sets it to the provided default (d).
 * @param {any} o
 * @param {any} d
 *****************************************************************************/
let setOrDefault = (o, d) => (o == null || o == undefined) ? d : o;
/******************************************************************************
 * Helper Method: getColumn
 * Gets the column index of a 9x9 board from the provided 0-80 cell index (i)
 * @param {any} i
 *****************************************************************************/
let getColumn = (i) => i % 9 === 9 ? 0 : i % 9;
/******************************************************************************
 * Helper Method: getRow
 * Gets the row index of a 9x9 board from the provided 0-80 cell index (i)
 * @param {any} i
 *****************************************************************************/
let getRow = (i) => parseInt(i / 9);
/******************************************************************************
 * Helper Method: getBox
 * Gets the 3x3 or irregular box index of a 9x9 grid from the provided index(i)
 * @param {any} i
 *****************************************************************************/
function getBox(i) {
    let col = parseInt(i % 9);
    let row = parseInt((i / 9) % 9);
    return boxCoords[row][col];
}
/******************************************************************************
 * Helper Method: getShape
 * Gets the shape coordinates index from boxCoords for the given position and
 * returns an array of numbers located in grid at the boxCoords(r,c) where 
 * r and c are determined by the position.
 * @param {any} grid
 * @param {any} position
 *****************************************************************************/
function getShape(grid, position) {
    let iArray = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let val = grid[r][c];
            if (position == boxCoords[r][c] && !iArray.includes(val) && val != 0) {
                iArray.push(val);
            }
        }
    }
    return iArray;
}
/******************************************************************************
 * Helper method: isComparable
 * Compares two arrays and returns true is they contain the same items, 
 * false if not.
 * @param {any} expect
 * @param {any} actual
 *****************************************************************************/
function isComparable(expect, actual) {
    let expArray = expect.slice();
    let actArray = actual.slice();
    return expArray.length === actArray.length
        && expArray.sort().every(function (value, index) {
            return value === actArray.sort()[index]
        });
}
/******************************************************************************
 * Helper method: noConflicts
 * Checks for num conflicts within the given row, col or calculated box
 * @param {any} grid
 * @param {any} row
 * @param {any} col
 * @param {any} num
 *****************************************************************************/
function noConflicts(grid, row, col, num) {
    return isRowOk(grid, row, num) && isColOk(grid, col, num) && isBoxOk(grid, row, col, num);
}
/******************************************************************************
 * Helper method: isRowOk
 * Checks for num conflicts within the given row
 * @param {any} grid
 * @param {any} row
 * @param {any} num
 *****************************************************************************/
function isRowOk(grid, row, num) {
    for (var col = 0; col < 9; col++) {
        if (grid[row][col] == num) {
            return false;
        }
    }
    return true;
}
/******************************************************************************
 * Helper method: isColOk
 * Checks for num conflicts within the given col
 * @param {any} grid
 * @param {any} col
 * @param {any} num
 *****************************************************************************/
function isColOk(grid, col, num) {
    for (var row = 0; row < 9; row++) {
        if (grid[row][col] == num) {
            return false;
        }
    }
    return true;
}
/******************************************************************************
 * Helper method: isBoxOk
 * Checks for num conflicts within the calculated box
 * @param {any} grid
 * @param {any} row
 * @param {any} col
 * @param {any} num
 *****************************************************************************/
function isBoxOk(grid, row, col, num) {

    // First, get the 1-9 idx from boxCourds of the corresponding row/col
    let idx = parseInt(boxCoords[row][col]);
    // Then, build an array from grid where the idx matches the positions in
    // boxCoords.
    let arr = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let val = grid[r][c];
            if (val > 0 && parseInt(boxCoords[r][c]) === idx && !arr.includes(val)) {
                arr.push(val);
            }
        }
    }
    // Finally, return true if number is NOT included in the resultant array
    return !arr.includes(num);
    //row = parseInt(row / 3) * 3;
    //col = parseInt(col / 3) * 3;
    //
    //for (var r = 0; r < 3; r++) {
    //    for (var c = 0; c < 3; c++) {
    //        if (grid[row + r][col + c] == num) {
    //            return false;
    //        }
    //    }
    //}
    //return true;
}
/******************************************************************************
 * Helper method: isSame
 * Compares values a and b and returns true or false if they are the same.
 * @param {any} a
 * @param {any} b
 *****************************************************************************/
function isSame(a, b) {
    if (a == null || a == undefined) return false;
    if (b == null || b == undefined) return false;
    return a === b;
}
/******************************************************************************
 * Helper method: hasBorder
 * Returns true or false if the cell at the boxCoords of row and col
 * should contain a border on the given side.
 * @param {any} row
 * @param {any} col
 * @param {any} side
 *****************************************************************************/
function hasBorder(row, col, side) {
    if (row == null || row == undefined) return false;
    if (col == null || col == undefined) return false;
    if (side == null || side == undefined) return false;
    return side == "right" ?
        col < 8 && !isSame(boxCoords[row][col], boxCoords[row][col + 1]) :
        side == "bottom" ?
            row < 8 && !isSame(boxCoords[row][col], boxCoords[row + 1][col]) :
            false;
}
/******************************************************************************
 * Helper method: getSpacer
 * A printGrid method that returns a character given the position of the
 * row and col cell in the boxCoords array.
 * @param {any} row
 * @param {any} col
 *****************************************************************************/
function getSpacer(row, col) {
    if (row == null || row == undefined) return "+";
    if (col == null || col == undefined) return "+";
    let a = boxCoords[row][col];
    let b = boxCoords[row + 1][col];
    let c = boxCoords[row][col + 1];
    let d = boxCoords[row + 1][col + 1];
    let sp = "+"; // default
    if (a == b && a == c && a == d) { sp = " "; }
    if (a == b && c == d && a != d) { sp = "|"; }
    if (a == c && b == d && a != b) { sp = "-"; }
    return sp;
}
/******************************************************************************
 * Helper method: printGrid
 * Returns a text rpt for output to the console.log of the given grid
 * @param {any} grid
 * @param {any} gridId
 * @param {any} replaceZero
 *****************************************************************************/
function printGrid(grid, gridId, replaceZero = "0") {
    let rpt = `Grid: ${gridId}\n`;
    rpt += "+-----------------------------------+\n";
    rpt += "|";
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let val = grid[r][c];
            rpt += ` ${val == 0 ? replaceZero : val} `;
            rpt += c == 8 ? "" : hasBorder(r, c, "right") ? "|" : " ";
        }
        if (r < 8) {
            rpt += "|\n|";
            for (let c = 0; c < 9; c++) {
                rpt += hasBorder(r, c, "bottom") ? "---" : "   ";
                rpt += c == 8 ? "" : getSpacer(r, c);
            }
            rpt += "|\n|";
        }
    }
    rpt += "|\n";
    rpt += "+-----------------------------------+\n";
    return rpt;
}
//#############################################################################
//#endregion HELPER METHODS

//#region OBJECTS
//#############################################################################
/* Board is a two-dimentional, 9x9 integer array (See const emptyBoard for an 
 * example). The constuctor can take an 81-char string (delimited or not), an
 * array of 9-char strings or a 9x9 integer array as input.
 *****************************************************************************/
class Board {
    //#region CONSTRUCTOR
    constructor(id, board) {
        // Check for a null entry, default to 1
        this.id = setOrDefault(id, 1);
        this.board = [];

        // Check for a null entry, default to emptyBoard
        board = setOrDefault(board, emptyBoard);
        // Initiallize input test. Set to "false" if valid input.
        let isBadInput = true;

        // Accept input of 81-char string or comma, space or tab-delimited string of 81 chars
        if (typeof (board) == "string" && board.replace(/,|\ |\t/g, "").length > 80) {
            console.log("Provided board is a string");
            this.board = Board.parseStrToBoard(board);
            isBadInput = false;
        } else {
            // Accept some kind of Array
            if (typeof (board) == "object" && Array.isArray(board)) {
                //Accept an Array of 9-char strings.
                if (typeof (board[0]) == "string" && board[0].length === 9) {
                    console.log("Provided board is a 1D array");
                    this.board = Board.parseArrayToBoard(board);
                    isBadInput = false;
                } else {
                    // Accept a proper 9x9 integer Array
                    if (typeof (board[0]) == "object" && Array.isArray(board[0]) && board[0].length === 9) {
                        console.log("Provided board is a proper 2D array");
                        this.board = board;
                        isBadInput = false;
                    }
                }
            }
        }
        if (isBadInput) {
            // Bad input. Reject and fall back to emptyBoard by default
            console.log("Provided board was either null or invalid format. Defaulting to emptyBoard.");
            Error("Provided board was either null or invalid format. Defaulting to emptyBoard.");
            this.board = new Board(this.id, emptyBoard.toString());
        }
    }
    //#endregion
    
    //#region INSTANCE METHODS
    // Get the value of the cell at the given idx
    getValue = (i) => this.board[getRow(i)][getColumn(i)];

    // Get the visible existing values from the cell at the given idx
    getExisting(index) {
        // An idx is a number corresponding to the cell from 0 - 80
        let idx = parseInt(index);
        let iArray = [];
        for (var i = 0; i < 9; i++) {
            let val = parseInt(this.board[getRow(idx)][i]);
            if (val > 0 && !iArray.includes(val)) {
                iArray.push(val);
            }
        }
        for (var i = 0; i < 9; i++) {
            let val = parseInt(this.board[i][getColumn(idx)]);
            if (val > 0 && !iArray.includes(val)) {
                iArray.push(val);
            }
        }
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                let boxIdx = ((i * 9) + j);
                if (getShape(this.board, boxIdx) === getShape(this.board, idx)) {
                    let val = parseInt(this.board[i][j]);
                    if (val > 0 && !iArray.includes(val)) {
                        iArray.push(val);
                    }
                }
            }
        }
        return iArray.sort();
    }

    // Get the remaining possibilities visible from the cell at the given idx
    getPossibilities(index) {
        // An idx is a number corresponding to the cell from 0 - 80
        let idx = parseInt(index);
        if (this.board[getRow(idx)][getColumn(idx)] > 0) { return []; }
        let possible = new Set(expected);
        let existing = this.getExisting(idx);
        existing.forEach(i => possible.delete(parseInt(i)));
        return [...possible].sort();
    }

    solve() {
        let updated = true, solved = false
        while (updated && !solved) {
            updated = this.fillObvious();
            solved = this.isSolved();
        }
        if (!solved) {
            solved = this.fillBackTrace(this.board, 0, 0);
        }
        return solved;
    }

    fillObvious () {
        // Set to false at the start of the loop
        let updated = true;
        let log = "";
        while (updated == true && !this.isSolved()) {
            updated = false;
            for (let i = 0; i < 81; i++) {
                let row = getRow(i);
                let col = getColumn(i);
                let cell = this.board[row][col];
                if (cell > 0) {
                    log += `Cell ${i} has a value of ${cell} and is filled.\n`;
                    continue;
                }
                let poss = this.getPossibilities(i);
                if (poss.length === 1) {
                    this.board[row][col] = poss[0];
                    log += `Cell ${i} has 1 possibity of ${poss[0]} and has been updated.\n`;
                    updated = true;
                }
                if (poss.length > 1) {
                    log += `Cell ${i} has possibities of ${[...poss].toString()} and can't be updated.\n`;
                    continue;
                }
            }
        }
        log += `Board has ${updated == true ? "" : "not"} been updated.\n`;
        if (verboseLogs) { console.log(log); }
        return updated;
    }

    fillBackTrace(board, row, col) {
        var coords = this.findEmptyCell(board, row, col);
        row = coords[0];
        col = coords[1];
        // base case: if no empty cell  
        if (row == -1) {
            console.log("solved");
            return true;
        }
        for (var val = 1; val <= 9; val++) {
            if (noConflicts(board, row, col, val)) {
                board[row][col] = val;

                if (this.fillBackTrace(board, row, col)) {
                    return true;
                }
                // mark cell as empty (with 0)    
                board[row][col] = 0;
            }
        }
        // trigger back tracking
        return false;
    }

    findEmptyCell(board, row, col) {
        var done = false;
        var coords = [-1, -1];

        while (!done) {
            if (row == 9) {
                done = true;
            } else {
                if (board[row][col] == 0) {
                    coords[0] = row;
                    coords[1] = col;
                    done = true;
                } else {
                    if (col < 8) {
                        col++;
                    } else {
                        row++;
                        col = 0;
                    }
                }
            }
        }
        return coords;
    }

    isSolved () {
        let valid = true;
        // Check all rows for blanks (values of 0)
        for (let i = 0; i < 9; i++) {
            if (this.board[i].includes(0)) {
                valid = false;
                break;
            }
        }
        // Check all indeces against the visible existing values for each index
        for (let i = 0; i < 81 && valid == true; i++) {
            if (!isComparable(expected, this.getExisting(i))) {
                valid = false;
            }
        }
        return valid;
    }

    // Return a clone of the existing board
    clone() {
        return new Board(`${this.id}.1`, this.board);
    }

    // Clear out the board
    clear() {
        this.board.splice(0);
        this.board = Board.parseStrToBoard(emptyBoard.toString());
    }

    // Print the board to the console log
    print() {
        let rpt = printGrid(this.board, this.id, "_");
        rpt += printGrid(boxCoords, "Box Coordinates");
        console.log(rpt);
        //#region OLD WAY 
        /**********************************************
        let log = `Board: ${this.id}\n`;
        for (let i = 0; i < 9; i++) {
            let row = this.board[i];
            if (i % 3 == 0) {
                log += "+-------+-------+-------+\n";
            }
            for (let j = 0; j < 9; j++) {
                if (j % 3 == 0) { log += "| "; }
                log += `${row[j]==0 ? "_" : row[j]} `;
            }
            log += "|\n";
        }
        log += "+-------+-------+-------+\n";
        console.log(log);
        ***********************************************/
        //#endregion
    }
    //#endregion

    //#region STATIC METHODS
    // Parse a 9-element string array of integers into a 9x9 integer array
    static parseArrayToBoard(array) {
        let board = [];
        array.forEach(row => board.push(Array.from(row)));
        return board;
    }

    // Parse a string of integers (delimited or not) into a 9x9 integer array
    static parseStrToBoard(str) {
        let board = [];
        str = str.replace(/,|\ |\t/g, "");
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                row.push(str.substr((i + j), 1));
            }
            board.push(row);
        }
        return board;
    }

    //#endregion
}

class Sudoku {
    //#region CONSTRUCTOR
    constructor(id, puzzle, target, renderStyle) {
        this.id = setOrDefault(id, 1);
        this.puzzle = new Board("Puzzle", puzzle);
        this.target = new Board("Target", target);
        this.given = new Board("Given", emptyBoard.toString());
        this.renderStyle = setOrDefault(renderStyle, RenderStyle.DIV);
        this.rows = [];
        this.init();
    }

    init() {
        checkForCss();
        for (let i = 0; i < 9; i++) {
            let row = new SudokuRow(i);
            this.rows.push(row);
        }
        this.rows.forEach(r => {
            r.grid = this;
            r.cells.forEach(c => {
                c.grid = this;
            })
        });
        this.load();
    }
    //#endregion
    //#region INSTANCE METHODS
    load() {
        // First, populate the given board
        for (let i = 0; i < 81; i++) {
            let r = getRow(i);
            let c = getColumn(i);
            this.given.board[r][c] = this.puzzle.board[r][c] == 0 ? 0 : 1;
        }
        // Now, populate the cells of the Sudoku grid and set their properties
        for (let i = 0; i < 9; i++) {
            let row = this.rows[i];
            for (let j = 0; j < 9; j++) {
                let cell = row.cells[j];
                cell.isGiven = parseInt(this.given.board[i][j]) === 1;
                cell.value = this.puzzle.board[i][j];
                cell.hasRightBorder  = hasBorder(i, j, "right");
                cell.hasBottomBorder = hasBorder(i, j, "bottom");
            }
        }
    }

    solve() {
        this.puzzle.solve();
        let msg = "Result matches target. Puzzle may have a unique solution.";
        if (!this.matchesTarget()) {
            msg = "Result does not match target. Puzzle does not contain a unique solution.";
        }
        console.log(msg);
        alert(msg);
        this.load();
        return this.render();
    }

    matchesTarget() {
        let matches = true;
        for (let i = 0; i < 9; i++) {
            if (!isComparable(this.puzzle.board[i], this.target.board[i])) {
                matches = false;
            }
        }
        return matches;
    }

    empty() {
        this.puzzle.clear();
        this.load();
        return this.render();
    }

    reset(board) {
        this.puzzle.clear();
        this.puzzle = new Board(this.id, board);
        this.load();
        return this.render();
    }

    render(renderStyle) {
        renderStyle = setOrDefault(renderStyle, this.renderStyle);
        let results = "";
        for (let i = 0; i < 9; i++) {
            let row = this.rows[i];
            results += row.render();
        }
        let pattern = renderStyle === RenderStyle.TABLE
            ? `<table class="grid">${results}</table>`
            : `<div class="grid">${results}</div>`;
        return pattern;
    }

    report() {
        let rpt = `Grid "${this.id}" Report\n`;
        rpt += "=====================================================================\n";
        rpt += "GridId       Row Col Box Cell Val Possibilities     VisibleToCell    \n";
        rpt += "============ === === === ==== === ================= =================\n";
        for (let i = 0; i < 9; i++) {
            rpt += this.rows[i].report();
        }
        rpt += "=====================================================================\n";
        rpt += "End Report\n";
        console.log(rpt);
        this.puzzle.print();
    }
    //#endregion
    //#region STATIC METHODS
    //#endregion
}

class SudokuRow {
    //#region CONSTRUCTOR
    constructor(id) {
        this.grid;
        this.id = setOrDefault(id, 0);
        this.cells = [];
        this.init();
    }
    //#endregion

    //#region INSTANCE METHODS
    init() {
        for (let i = 0; i < 9; i++) {
            let j = ((this.id * 9) + i);
            let cell = new SudokuCell(j);
            this.cells.push(cell);
        }
    }
    report() {
        var cellReport = "";
        for (let i = 0; i < 9; i++) {
            cellReport += this.cells[i].report();
        }
        return cellReport;
    }

    render() {
        let results = "";
        for (let i = 0; i < 9; i++) {
            let cell = this.cells[i];
            results += cell.render();
        }
        let pattern = this.grid.renderStyle == RenderStyle.TABLE
            ? `<tr class="row">${results}</tr>`
            : `<div class="row">${results}</div>`;
        return pattern;
    }
    //#endregion

    //#region STATIC METHODS
    //#endregion
}

class SudokuCell {
    //#region CONSTRUCTOR
    constructor(id) {
        this.id = setOrDefault(id, 0);
        this.grid;
        this.value = 0;
        this.isGiven = false;
        this.hasRightBorder = false;
        this.hasBottomBorder = false;
    }
    //#endregion

    //#region INSTANCE METHODS
    render() {
        let val = `<input id="cell${this.id}" type="text" value="${parseInt(this.value).hideZero()}"/>`;
        let css = this.hasRightBorder ? " box-right" : "";
        css += this.hasBottomBorder ? " box-bottom" : "";
        css += this.isGiven ? " given" : "";
        let pattern = this.grid.renderStyle == RenderStyle.TABLE
            ? `<td class="cell${css}">${val}</td>`
            : `<div class="cell${css}">${val}</div>`;
        return pattern;
    }

    report() {
        let puzzle = this.grid.puzzle;
        let visible = puzzle.getExisting(this.id);
        let possibilities = puzzle.getPossibilities(this.id);
        let possibles = (possibilities.length < 1)
            ? "                 " : (possibilities.length > 1)
            ? `${possibilities.toString().pad(17)}` : possibilities[0].hideZero().pad(17);
        let grid = this.grid.id.clip(12).pad(12);
        let row = getRow(this.id);
        let col = getColumn(this.id);
        let box = getBox(this.id);
        let id = this.id.pad(2);
        let val = this.value;
        return `${grid}  ${row}   ${col}   ${box}   ${id}   ${val}  ${possibles} ${visible}\n`;
    }
    //#endregion
    //#region STATIC METHODS
    //#endregion
}
//#############################################################################
//#endregion OBJECTS
