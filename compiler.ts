import { Emitter } from "./emitter";

// Grammer: https://www.cs.helsinki.fi/u/vihavain/k10/okk/minipascal/minipascalsyntax.html

let current: string = null;
let tokenType: TokenType = null;
let currentToken: string = null;
let nextPosition = 0;
let input = '1 + 2 * 3';
let line = 1;
let column = 0;

let values: { [prop: string]: number | boolean } = {};

type DataType = 'integer' | 'Boolean';

const symbols: { [prop: string]: DataType } = {};

const emitter = new Emitter();

values['two'] = 2;

function skipWhitespaces() {
    while (current === ' ') {
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

    if (current === '\n') {
        column = 0;
        line++;
    }
    else if (current !== '\r') {
        column++;
    }

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
    throw new Error(`${s} expected at line ${line}, column ${column} (position ${nextPosition - 1})`);
}

function unexpected() {
    throw new Error(`unexpected token ${currentToken} at line ${line}, column ${column} (position ${nextPosition - 1})`);
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

    emitter.emit(`i32.const ${currentToken}`);

    const number = parseInt(currentToken);
    readToken();
    return number;
}

/*
<sign> ::=	+ | - | <empty>
<adding operator> ::=	+ | - | or
<multiplying operator> ::=	* | div | and
*/

function isRelationalOperator() {
    const operators = ['=', '<', '>', '<=', '>=', '<>'];
    return operators.indexOf(currentToken) !== -1;
}

function expression() {
    const e1 = simpleExpression();
    if (!isRelationalOperator()) return e1;

    //console.debug('op', currentToken);
    const op = currentToken;
    readToken();
    const e2 = simpleExpression();

    switch (op) {
        case '=': {
            emitter.emit(`i32.eq`);
            return e1 < e2;
        }
        case '<': {
            emitter.emit(`i32.lt_s`);
            return e1 < e2;
        }
        case '>': {
            emitter.emit(`i32.gt_s`);
            return e1 > e2;
        }
        case '>=': { 
            emitter.emit(`i32.ge_s`);
            return e1 >= e2;
        }
        case '<=': {
            emitter.emit(`i32.le_s`);
            return e1 <= e2;
        }
        case '<>': {
            emitter.emit(`i32.ne`);
            return e1 != e2;
        }
        default: throw new Error('unknown operator ' + op);
    }

}

// <expression> ::=	<sign> <term> { <adding operator> <term> }
function simpleExpression() {
    let t = term();
    while (currentToken === '+' || currentToken === '-' || currentToken === 'or') {
        const op = addingOperator();
        const t2 = term();

        if (op === '+') {
            t = t + t2;
            emitter.emit(`i32.add`);
        }
        else if (op === '-') {
            t = t - t2;
            emitter.emit(`i32.sub`);
        }
        else {
            t = Boolean(t) || Boolean(t2);
            emitter.emit(`i32.or`);
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
    else if (currentToken === 'or') {
        match('or');
        return 'or';
    }
    else {
        expected('+, or, -');
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
    else if (currentToken === 'and') {
        match('and');
        return 'and';
    }
    else {
        expected('*, and, /');
    }
}


// <term> ::=	<factor> { <multiplying operator> <factor> }
function term() {
    let f = factor();
    while (currentToken === '*' || currentToken === '/' || currentToken === 'and') {
        const op = mulOperator();
        const f2 = factor();

        if (op === '*') {
            f = f * f2;
            emitter.emit(`i32.mul`);
        }
        else if (op === '/') {
            f = f / f2;
            emitter.emit(`i32.div_s`);
        }
        else {
            f = Boolean(f) && Boolean(f2);
            emitter.emit(`i32.and`);
        }

    }

    return f;
}

// <factor> ::=	<digit> | ( <expression> )
function factor() {
    let result;

    if (currentToken === 'not') {
        match('not');
        let f = factor();
        emitter.emit(`i32.eqz`);
        f = !f;
        result = f;
    }
    else if (currentToken === '(') {
        match('(');
        result = expression();
        match(')');
    }
    else if (tokenType === 'identifier') {
        if (!symbols[currentToken]) {
            throw new Error('unkown variable ' + currentToken);
        }
        result = readVariable();
    }
    else if (currentToken === 'true' || currentToken === 'false') {
        result = boolean();
    }
    else {
        result = number();
    }
    return result;
}

function boolean() {
    const b = currentToken === 'true';
    readToken();
    return b; 
}

function readVariable() {
    if (typeof values[currentToken] === 'undefined') {
        throw new Error(`variable ${currentToken} is not defined`);
    }

    emitter.emit(`get_local $${currentToken}`);

    const result = values[currentToken];
    readToken();
    return result;
}

function initVariable(variable, value) {
    //console.debug(variable + ' = ' + value);
    values[variable] = value;
}

function writeVariable(variable, value) {
    //console.debug(variable + ' = ' + value);
    emitter.emit(`set_local $${variable}`);
    values[variable] = value;
}

function matchIdentifier() {
    if (tokenType !== 'identifier') {
        expected('IDENTIFIER');
    }
    const result = currentToken;
    readToken();
    return result;
}

// <program> ::=	program <identifier> ; <block> .
function program() {
    match('program');
    const p = matchIdentifier();
    
    //console.debug('program', p);

    match(';');

    emitter.emit(`(module `);
    emitter.incIndent();
    emitter.emit(`(import "console" "log" (func $log (param i32)))`);
    emitter.emit(`(func $${p}`); // (param $arg1 i32) (param $arg2 i32) (result i32)

    emitter.incIndent();
    emitter.emit(``);

    block();

    emitter.decIndent();
    emitter.emit(`)`);
    emitter.emit(`(export "${p}" (func $${p}))`)

    emitter.decIndent();
    emitter.emit(`)`);
}

// <block> ::=	<variable declaration part> <statement part>    
function block() {
    if (currentToken === 'var') {
        variableDeclarationPart();
        emitter.emit(``);
    }
    compoundStatement();
}

function variableDeclarationPart() {
    match('var');
    let v = variableDeclaration();
    match(';');
    while (tokenType === 'identifier') {
        v = variableDeclaration();
        match(';');
    }
}
// <variable declaration part> ::=	<empty> | var <variable declaration> ; { <variable declaration> ; }

function variableDeclaration() {
    const names = [];
    names.push(matchIdentifier());

    while (currentToken === ',') {
        names.push(matchIdentifier());
    }
    match(':');
    const type = matchIdentifier();

    if (type !== 'integer') {
        expected('integer');
    }
    //console.debug('var decl', type, names);

    names.forEach(n => {
        const initValue = (type === 'integer') ? 0 : false;
        initVariable(n, initValue);
        symbols[n] = type as DataType;
    });

    names.forEach(n => {
        emitter.emit(`(local $${n} i32)`);
    });
    
}

// <simple statement> ::= <assignment statement> | <procedure statement> | 
// <read statement> | <write statement>

// <assignment statement> ::=	<variable> := <expression>

function statement() {

    if (currentToken === 'write') {
        writeStatement();
        emitter.emit(``);
    }
    else if (currentToken === 'begin' || currentToken === 'if' || currentToken === 'while') {
        structuredStatement();
    }
    else {
        simpleStatement();
        emitter.emit(``);
    }
}

function writeStatement() {
    match('write');
    match('(');
    let e = expression();
    emitter.emit(`call $log`);
    //console.debug('output', e);
    while (currentToken === ',') {
        match(',');
        e = expression();
        emitter.emit(`call $log`);
        //console.debug('output', e);
    }
    match(')');
}


// <structured statement> ::=	<compound statement> | <if statement> | <while statement>
function structuredStatement() {
    if (currentToken === 'if') {
        ifStatement();
    }
    else if (currentToken === 'while') {
        whileStatement();
    }
    else {
        compoundStatement();
    }
}

function whileStatement() {
    match('while');

    emitter.emit(`(block (loop`);
    emitter.incIndent();

    const e = expression();

    emitter.emit(`i32.eqz`);
    emitter.emit(`br_if 1`);
    emitter.emit(``);

    //console.debug('while', e);
    match('do');
    statement();
    
    emitter.emit(`br 0`);
    emitter.decIndent();
    emitter.emit(`))`);
}

// <if statement> ::=	if <expression> then <statement> | if <expression> then <statement> else <statement>
function ifStatement() {
    match('if');
    const e = expression();
    //console.debug('if', e);
    match('then');

    emitter.emit(`(if`);
    emitter.incIndent();
    emitter.emit(`(then`)
    emitter.incIndent();

    statement();

    emitter.decIndent();
    emitter.emit(`)`);
    

    // ??
    // if (currentToken === ';') {
    //     match(';');
    // }
    if (currentToken === 'else') {
        match('else');
        //console.debug('else');

        emitter.emit(`(else`);
        emitter.incIndent();

        statement();
        emitter.decIndent();
        emitter.emit(`)`);
    }

    emitter.decIndent();
    emitter.emit(`)`);
}

// <while statement> ::=	while <expression> do <statement>


// <compound statement> ::=	begin <statement>{ ; <statement> } end
function compoundStatement() {
    match('begin');
    statement(); match(';');
    while (currentToken !== 'end') {
        statement(); match(';');
    }
    match('end');
}

function simpleStatement() {
    assignmentStatement();
}

function assignmentStatement() {
    const varName = variable();

    if (!symbols[varName]) throw new Error('unknown variable ' + varName);

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

function parseStatement(s: string) {
    input = s;
    nextPosition = 0;
    readNext();
    readToken();

    statement();
}

function parseProgram(s: string) {
    input = s;
    nextPosition = 0;
    readNext();
    readToken();

    program();
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
    'var', 'array', 'procedure', 'program', 'function', 'true', 'false'
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
            if (buffer !== '' && current === ';') break;
            if (buffer !== '' && current === ')') break;

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

symbols['two'] = 'integer';
symbols['a'] = 'integer';
symbols['b'] = 'integer';
symbols['c'] = 'integer';
symbols['d'] = 'integer';
symbols['e'] = 'integer';
symbols['f'] = 'integer';
symbols['length'] = 'integer';
symbols['height'] = 'integer';
symbols['area'] = 'integer';

// parseStatement('a := two + 10 + 200 * 10');
// parseStatement('b := 1 + 8 * 2');
// parseStatement('c := 8 * 2 + 1');

// parseStatement('d := (1 + 2) * 8');
// parseStatement('e := (   1+2)    *8');
// parseStatement(`
// begin
//     length := 200;
//     height := 100;
//     area := length * height;
// end;`);

// parseStatement(`
// begin
//     begin
//         length := 200;
//         height := 100;
//     end;

//     area := length * height;
//     write(length, height, area);
// end;`);

// parseStatement(`
//     begin
//         a := 1;
//         if (a + 2) then
//             write(1);
//         else
//             write(2);
//     end;
// `);

// parseStatement(`
//     begin
//         a := 1;
//         if (a + 2) then
//             begin
//                 write(1);
//             end;
//         else
//             begin
//                 write(2);
//             end;
//     end;
// `);

// parseStatement(`
//     begin
//         b := 2;
//         while b + 4 * 2 do
//             write(1);
//     end;
// `);

// parseStatement(`
//     begin
//         b := 2;
//         while b + 4 * 2 do
//         begin
//             write(1);
//         end;
//     end;
// `);

// parseStatement('a := 1 < 5');
// parseStatement('a := 1 + 1 < 5 - 1');
// parseStatement('a := (1 < 5) and (5 < 1)');
// parseStatement('a := (1 < 5) or (5 < 1)');

// parseStatement('a := true and true');
// parseStatement('a := true and false');
// parseStatement('a := true or true');
// parseStatement('a := true or false');


// parseProgram(`
//     program myProgram;
//     var 
//         x: integer;
//     begin
//         x := 17;
//         write(x);

//         if x > 10 then
//             begin
//                 write(1);
//             end
//         else
//             begin
//                 write(2);
//             end;
        
//         x := 0;

//         while not (x >= 10) do 
//         begin

//             if (x=3) or (x = 5) or (x = 7) then
//             begin
//                 write(999);
//             end;

//             write(x);
//             x := x + 1;
//         end;
        
//     end;
// `);


parseProgram(`
    program myProgram;
    var 
        x: integer;
        y: integer;
    begin
        
        x := 1;
        while x < 30 do
        begin

            if (x < 10) and (x <> 7) then
            begin
                write(x);
            end
            else
            begin

                y := 100 + x - 10;

                if not (y - 100 = 13) and ( x > 10 ) then
                begin
                    write(y);
                end;

            end;

            x := x + 1;
        end;

    end;
`);

/*
 while x > 10 do 
        begin
            x := x - 1;
            write(x);
        end;
*/

// parseProgram(`
//     program myProgram;
//     var 
//         x: integer;
//         y: integer;
//         z: integer;
//     begin
//         x := 10;
//         y := x + 2 * 5;
//         write(y);
//         z := 5 and 0;
//         write(z);   
//         z := 5 or 0;
//         write(z);
//         z := (5 > 1) and (1 > 5);
//         write(z);
//         z := (5 > 1) or (1 > 5);
//         write(z);
//     end;
// `);

/*
a := not true;
    b := not false;
    c := not (1 > 2);
    d := not (1 < 2);
*/    

// parseStatement(`
// begin
//     e := (not (1 > 2)) and (not false);
// end;    
// `);

// input = '17 abc abc123 1234 or >17 >a >= and blabla';
// readNext();
// while (readToken()) {
//     //console.debug(tokenType, currentToken);
// }
// //console.debug('END');