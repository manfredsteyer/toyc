let current: string = null;
let tokenType: TokenType = null;
let currentToken: string = null;
let nextPosition = 0;
let input = '1 + 2 * 3';

const values: { [prop: string]: number } = {};

values['two'] = 2;

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
    if (s === currentToken) {
        readToken();
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
    if (tokenType !== 'identifier') expected('Name');
    const result = currentToken;
    readToken();
    return result;
}

function number() {
    if (tokenType !== 'integer constant') expected('Number');
    const number = parseInt(currentToken);
    readToken();
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
    while(currentToken === '+' || currentToken === '-') {
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
    if (currentToken === '+') {
        match('+');
        return '+';
    }
    else if (currentToken === '-') {
        match('-');
        return '-';
    }
    else {
        expected('+ or -');
    }
}

function mulOperator() {
    if (currentToken === '*') {
        match('*');
        return '*';
    }
    else if (currentToken === '/') {
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
    while (currentToken === '*' || currentToken === '/') {
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

    if (currentToken === '(') {
        match('(');
        result = expression();
        match(')');
    }
    else if (tokenType === 'identifier') {
        result = readVariable();
    }
    else {
        result = number();
    }
    return result;
}

function readVariable() {
    if (typeof values[currentToken] === 'undefined') {
        throw new Error(`variable ${currentToken} is not defined`);
    }
    const result = values[currentToken];
    readToken();
    return result;
}

function writeVariable(variable, value) {
    console.debug(variable + ' = ' + value);
    values[variable] = value;
}


// <simple statement> ::= <assignment statement> | <procedure statement> | 
// <read statement> | <write statement>

// <assignment statement> ::=	<variable> := <expression>

function statement() {

    if (tokenType === 'special symbol') {
        console.debug('spec', currentToken);
        structuredStatement();
    }
    else {
        simpleStatement();
    }

}

function structuredStatement() {
    compoundStatement();
}

// <compound statement> ::=	begin <statement>{ ; <statement> } end
function compoundStatement() {
    match('begin');
    statement(); match(';');
    while(currentToken !== 'end') {
        statement(); match(';');
    }
    match('end');
}

function simpleStatement() {
    assignmentStatement();
}

function assignmentStatement() {
    const varName = variable();
    match(':=');
    const val = expression();
    writeVariable(varName, val);
}

function variable() {
    return identifier();
}

function identifier() {
    if (tokenType !== 'identifier') {
        expected('IDENTIFIER');
    }
    const result = currentToken;
    readToken();
    return result;
}





function parse(s: string) {
    input = s;
    nextPosition = 0;
    readNext();
    readToken();

    statement();
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

type TokenType = 'EOF' | 'special symbol' | 'integer constant' | 'identifier';

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


parse('a := two + 10 + 200 * 10');
parse('b := 1 + 8 * 2');
parse('c := 8 * 2 + 1');

parse('d := (1 + 2) * 8');
parse('e := (   1+2)    *8');
parse(`
begin
    length := 200;
    height := 100;
    area := length * height;
end;`);

parse(`
begin
    begin
        length := 200;
        height := 100;
    end;

    area := length * height;
end;`);

// input = '17 abc abc123 1234 or >17 >a >= and blabla';
// readNext();
// while (readToken()) {
//     console.debug(tokenType, currentToken);
// }
// console.debug('END');