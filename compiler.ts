let current: string = null;
let tokenType: string = null;
let currentToken: string = null;
let nextPosition = 0;
let input = '1 + 2 * 3';

function skipWhitespaces() {
    while(current === ' ') {
        readNext();
    }
}

function readNext() {
    if (nextPosition === input.length) {
        current = '';
        return '';
    }

    current = input.substr(nextPosition, 1);
    nextPosition++;
    return current;

    // do {
    //     current = input.substr(nextPosition, 1);
    //     nextPosition++;
    // }
    // while (current === ' ');
}

function match(s: string) {
    if (s === current) {
        readNext();
    }
    else {
        expected(s);
    }
}

function expected(s: string) {
    throw new Error(`${s} expected as position ${nextPosition-1}!`);
}

function unexpected() {
    throw new Error(`unexpected token at position ${nextPosition-1}!`);
}


function isDigit(s: string) {
    return s.match(/\d/);
}

function isAlpha(s: string) {
    return s.match(/[A-Za-z]/);
}

function matchName() {
    if (!isAlpha(current)) expected('Name');
    const result = current;
    readNext();
    return result;
}

function number() {
    if (!isDigit(current)) expected('Number');
    const number = parseInt(current);
    readNext();
    return number;
}

/*




<sign> ::=	+ | - | <empty>
<adding operator> ::=	+ | - | or
<multiplying operator> ::=	* | div | and
*/


// <expression> ::=	<sign> <term> { <adding operator> <term> }
function expression() {
    let t = term();
    while(current === '+' || current === '-') {
        const op = addingOperator();
        const t2 = term();
        
        if (op === '+') {
            t = t + t2;
        }
        else {
            t = t - t2;
        }
    }
    return t;
}

function addingOperator() {
    if (current === '+') {
        match('+');
        return '+';
    }
    else if (current === '-') {
        match('-');
        return '-';
    }
    else {
        expected('+ or -');
    }
}

function mulOperator() {
    if (current === '*') {
        match('*');
        return '*';
    }
    else if (current === '/') {
        match('/');
        return '/';
    }
    else {
        expected('* or /');
    }
}


// <term> ::=	<factor> { <multiplying operator> <factor> }
function term() {
    let f = factor();
    while (current === '*' || current === '/') {
        const op = mulOperator();
        const f2 = factor();

        if (op === '*') {
            f = f * f2;
        }
        else {
            f = f / f2;
        }

    }

    return f;
}

// <factor> ::=	<digit> | ( <expression> )
function factor() {
    let result;

    if (current === '(') {
        match('(');
        result = expression();
        match(')');
    }
    else {
        result = number();
    }
    return result;
}

function parse(s: string) {
    input = s;
    nextPosition = 0;
    readNext();

    const r = expression();
    console.debug('result', r);
}


function isEOF(s: string) {
    return s === '';
}

function isSpecialChar(s: string) {
    return !isDigit(s) && !isAlpha(s) && !isWhitespace(s) && !isEOF(s);
}

function isWhitespace(c: string) {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
}

const SPECIAL_SYMBOLS = [
    '+', '-', '*', '=', '(', ')', '[', ']', '.', ',', ';', '>', '<', '>=', '<=', '<>', ':', ':=', '/',
    'and', 'or', 'div', 'not', 'if', 'then', 'else', 'of', 'while', 'do', 'begin', 'end', 'read', 'write',
    'var', 'array', 'procedure', 'program', 'function'
];

function readToken() {
    let buffer = '';

    if (current === '') {
        currentToken = '';
        tokenType = 'EOF';
        return currentToken;
    } 

    while (isWhitespace(current)) {
        readNext();
    }
    //if ( ['+', '-', '*', '=', '(', ')', '[', ']', '.', ',', ';' ].indexOf(current) != -1 ) {

    if (isSpecialChar(current)) {
        while (isSpecialChar(current)) {
            buffer += current;
            readNext();
        }

        if (SPECIAL_SYMBOLS.indexOf(buffer) === -1) {
            unexpected();
        }

        tokenType = 'special symbol';
        currentToken = buffer;
        return currentToken;
    }

    if (isDigit(current)) {
        while (isDigit(current)) {
            buffer += current;
            readNext();
        }
        if (isAlpha(current)) {
            expected('digit or operator');
        }
        currentToken = buffer;
        tokenType = 'integer constant';
        return currentToken
    }

    if (isAlpha(current)) {
        while (isAlpha(current) || isDigit(current)) {
            buffer += current;
            readNext();
        }
        
        currentToken = buffer;
        if (SPECIAL_SYMBOLS.indexOf(buffer) > -1) {
            tokenType = 'special symbol';
        }
        else {
            tokenType = 'identifier'
        }
        return currentToken;

    }

}


// parse('1 + 2 * 8');
// parse('1 + 8 * 2');
// parse('8 * 2 + 1');

// parse('(1 + 2) * 8');
// parse('(   1+2)    *8');


input = '17 abc abc123 1234 or >17 >a >= and blabla';
readNext();
while (readToken()) {
    console.debug(tokenType, currentToken);
}
console.debug('END');