import { ConsoleEmitter, StringEmitter } from "./emitter";
import { DataType, Emitter } from "./types";
import { init, readToken, context, expected, error } from "./lexer";

// Grammer: https://www.cs.helsinki.fi/u/vihavain/k10/okk/minipascal/minipascalsyntax.html
// This Grammer has been partly implemented: Skipped arrays, procedures, and the read keyword

const MAX_INT32 = Math.pow(2,32) / 2 - 1;

const symbols: { [prop: string]: DataType } = {};
let emitter: Emitter = new StringEmitter();

export function setEmitter(e: Emitter) {
    emitter = e;
}

// <program> ::= program <identifier> ; <block> .
function program() {
    match('program');
    const p = matchIdentifier();
    
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
    emitter.emit(`(export "main" (func $${p}))`)

    emitter.decIndent();
    emitter.emit(`)`);
}

// <block> ::= <variable declaration part> <statement part>    
function block() {
    if (context.currentToken === 'var') {
        variableDeclarationPart();
        emitter.emit(``);
    }
    compoundStatement();
}

// <variable declaration part> ::=	<empty> | var <variable declaration> ; { <variable declaration> ; }
function variableDeclarationPart() {
    match('var');
    let v = variableDeclaration();
    match(';');

    while (context.currentToken !== 'begin') {
        v = variableDeclaration();
        match(';');
    }
}

function matchVariableName() {
    let varName = matchIdentifier();
    if (varName === 'integer') {
        expected('VARIABLE NAME', 'variables cannot be named after datatypes!');
    }
    return varName;
}

// <variable declaration> ::= <identifier > { , <identifier> } : <type>
// <type> ::= <identifier>
function variableDeclaration() {
    const names = [];
    let varName = matchVariableName();

    names.push(varName);

    while (context.currentToken === ',') {
        varName = matchVariableName();
        names.push(varName);
    }
    match(':');
    const type = matchIdentifier();

    if (type !== 'integer') {
        expected('integer', 'this toy compiler only supports the type integer');
    }

    names.forEach(n => {
        const initValue = (type === 'integer') ? 0 : false;
        symbols[n] = type as DataType;
    });

    names.forEach(n => {
        emitter.emit(`(local $${n} i32)`);
    });
    
}

// <statement> ::= <simple statement> | <structured statement>
function statement() {

    if (context.currentToken === 'begin' || context.currentToken === 'if' || context.currentToken === 'while') {
        structuredStatement();
    }
    else {
        simpleStatement();
        emitter.emit(``);
    }
}

// <structured statement> ::= <compound statement> | <if statement> | <while statement>
function structuredStatement() {
    if (context.currentToken === 'if') {
        ifStatement();
    }
    else if (context.currentToken === 'while') {
        whileStatement();
    }
    else {
        compoundStatement();
    }
}

// <while statement> ::=	while <expression> do <statement>
function whileStatement() {
    match('while');

    emitter.emit(`(block (loop`);
    emitter.incIndent();

    const e = expression();

    emitter.emit(`i32.eqz`);
    emitter.emit(`br_if 1`);
    emitter.emit(``);

    match('do');
    statement();
    
    emitter.emit(`br 0`);
    emitter.decIndent();
    emitter.emit(`))`);
}

// <if statement> ::= if <expression> then <statement> 
//                    | if <expression> then <statement> else <statement>
function ifStatement() {
    match('if');
    const e = expression();

    match('then');

    emitter.emit(`(if`);
    emitter.incIndent();
    emitter.emit(`(then`)
    emitter.incIndent();

    statement();

    emitter.decIndent();
    emitter.emit(`)`);

    if (context.currentToken === 'else') {
        match('else');

        emitter.emit(`(else`);
        emitter.incIndent();

        statement();
        emitter.decIndent();
        emitter.emit(`)`);
    }

    emitter.decIndent();
    emitter.emit(`)`);
}

// <compound statement> ::=	begin <statement>{ ; <statement> } end
function compoundStatement() {
    match('begin');
    statement(); match(';');
    while (context.currentToken !== 'end') {
        statement(); match(';');
    }
    match('end');
}

// <simple statement> ::= <assignment statement> | <write statement>
function simpleStatement() {
    if (context.currentToken === 'write') {
        writeStatement();
        emitter.emit(``);
    }
    else if (context.tokenType === 'identifier') {
        assignmentStatement();
    }
    else {
        expected('STATEMENT');
    }
}

// <write statement> ::= write ( <expression> { , <expression> } )
function writeStatement() {
    match('write');
    match('(');
    let e = expression();
    emitter.emit(`call $log`);

    while (context.currentToken === ',') {
        match(',');
        e = expression();
        emitter.emit(`call $log`);
    }
    match(')');
}

// <assignment statement> ::= <variable> := <expression>
function assignmentStatement() {

    const varName = variable();

    if (!symbols[varName]) error('unknown variable ' + varName);

    match(':=');
    const val = expression();
    writeVariable(varName, val);
}

// <expression> ::=	<simple expression>  
//                  | <simple expression> <relational operator> <simple expression>
function expression() {
    simpleExpression();
    if (!isRelationalOperator()) return;

    const op = context.currentToken;
    readToken();
    simpleExpression();

    switch (op) {
        case '=': {
            emitter.emit(`i32.eq`);
            break;
        }
        case '<': {
            emitter.emit(`i32.lt_s`);
            break;
        }
        case '>': {
            emitter.emit(`i32.gt_s`);
            break;
        }
        case '>=': { 
            emitter.emit(`i32.ge_s`);
            break;
        }
        case '<=': {
            emitter.emit(`i32.le_s`);
            break;
        }
        case '<>': {
            emitter.emit(`i32.ne`);
            break;
        }
        default: throw new Error('unknown operator ' + op);
    }
}

// <expression> ::=	<sign> <term> { <adding operator> <term> }
function simpleExpression() {
    term();
    while (context.currentToken === '+' || context.currentToken === '-' || context.currentToken === 'or') {
        const op = addingOperator();
        term();

        if (op === '+') {
            emitter.emit(`i32.add`);
        }
        else if (op === '-') {
            emitter.emit(`i32.sub`);
        }
        else {
            emitter.emit(`i32.or`);
        }
    }
}

// <adding operator> ::= + | - | or
function addingOperator() {
    if (context.currentToken === '+') {
        match('+');
        return '+';
    }
    else if (context.currentToken === '-') {
        match('-');
        return '-';
    }
    else if (context.currentToken === 'or') {
        match('or');
        return 'or';
    }
    else {
        expected('one of: +, -, or');
    }
}

// <multiplying operator> ::= * | div | and
function mulOperator() {
    if (context.currentToken === '*') {
        match('*');
        return '*';
    }
    else if (context.currentToken === '/' || context.currentToken === 'div') {
        match('/');
        return '/';
    }
    else if (context.currentToken === 'and') {
        match('and');
        return 'and';
    }
    else {
        expected('one of: *, /, div, and');
    }
}

// <term> ::= <factor> { <multiplying operator> <factor> }
function term() {
    factor();
    while (context.currentToken === '*' || context.currentToken === '/' || context.currentToken === 'and') {
        const op = mulOperator();
        factor();

        if (op === '*') {
            emitter.emit(`i32.mul`);
        }
        else if (op === '/') {
            emitter.emit(`i32.div_s`);
        }
        else {
            emitter.emit(`i32.and`);
        }
    }
}

// <factor> ::=	<digit> | ( <expression> )
function factor() {

    if (context.currentToken === 'not') {
        match('not');
        factor();
        emitter.emit(`i32.eqz`);
    }
    else if (context.currentToken === '(') {
        match('(');
        expression();
        match(')');
    }
    else if (context.tokenType === 'identifier') {
        if (!symbols[context.currentToken]) {
            throw new Error('unkown variable ' + context.currentToken);
        }
        readVariable();
    }
    // booleans are currently not supported
    // else if (currentToken === 'true' || currentToken === 'false') {
    //     result = boolean();
    // }
    else {
        number();
    }
}

// function boolean() {
//     const b = context.currentToken === 'true';
//     readToken();
//     return b; 
// }

function readVariable() {

    emitter.emit(`get_local $${context.currentToken}`);
    readToken();
}

function writeVariable(variable, value) {
    emitter.emit(`set_local $${variable}`);
}

function matchIdentifier() {
    if (context.tokenType !== 'identifier') {
        expected('IDENTIFIER');
    }
    const result = context.currentToken;
    readToken();
    return result;
}

function variable() {
    return identifier();
}

function identifier() {
    if (context.tokenType !== 'identifier') {
        expected('IDENTIFIER');
    }
    const result = context.currentToken;
    readToken();
    return result;
}

export function parseStatement(s: string) {
    init(s);
    statement();
}

function match(s: string) {
    if (s === context.currentToken) {
        readToken();
    }
    else {
        expected(s);
    }
}

function number() {
    if (context.tokenType !== 'integer constant') expected('Number');
    
    if (parseInt(context.currentToken) > MAX_INT32) {
        error(`The value ${context.currentToken} is too long for a 32bit integer. Maximum=${MAX_INT32}`);
    }

    emitter.emit(`i32.const ${context.currentToken}`);
    readToken();
}

function isRelationalOperator() {
    const operators = ['=', '<', '>', '<=', '>=', '<>'];
    return operators.indexOf(context.currentToken) !== -1;
}

export function parseProgram(s: string) {
    emitter.reset();
    init(s);
    program();

    if (emitter instanceof StringEmitter) {
        return emitter.output
    }
    else {
        return null;
    }
}