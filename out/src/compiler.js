"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var emitter_1 = require("./emitter");
var lexer_1 = require("./lexer");
// Grammer: https://www.cs.helsinki.fi/u/vihavain/k10/okk/minipascal/minipascalsyntax.html
// This Grammer has been partly implemented: Skipped arrays, procedures, and the read keyword
var symbols = {};
var emitter = new emitter_1.StringEmitter();
function setEmitter(e) {
    emitter = e;
}
exports.setEmitter = setEmitter;
// <program> ::= program <identifier> ; <block> .
function program() {
    match('program');
    var p = matchIdentifier();
    match(';');
    emitter.emit("(module ");
    emitter.incIndent();
    emitter.emit("(import \"console\" \"log\" (func $log (param i32)))");
    emitter.emit("(func $" + p); // (param $arg1 i32) (param $arg2 i32) (result i32)
    emitter.incIndent();
    emitter.emit("");
    block();
    emitter.decIndent();
    emitter.emit(")");
    emitter.emit("(export \"main\" (func $" + p + "))");
    emitter.decIndent();
    emitter.emit(")");
}
// <block> ::= <variable declaration part> <statement part>    
function block() {
    if (lexer_1.context.currentToken === 'var') {
        variableDeclarationPart();
        emitter.emit("");
    }
    compoundStatement();
}
// <variable declaration part> ::=	<empty> | var <variable declaration> ; { <variable declaration> ; }
function variableDeclarationPart() {
    match('var');
    var v = variableDeclaration();
    match(';');
    while (lexer_1.context.currentToken !== 'begin') {
        v = variableDeclaration();
        match(';');
    }
}
function matchVariableName() {
    var varName = matchIdentifier();
    if (varName === 'integer') {
        lexer_1.expected('VARIABLE NAME', 'variables cannot be named after datatypes!');
    }
    return varName;
}
// <variable declaration> ::= <identifier > { , <identifier> } : <type>
// <type> ::= <identifier>
function variableDeclaration() {
    var names = [];
    var varName = matchVariableName();
    names.push(varName);
    while (lexer_1.context.currentToken === ',') {
        varName = matchVariableName();
        names.push(varName);
    }
    match(':');
    var type = matchIdentifier();
    if (type !== 'integer') {
        lexer_1.expected('integer', 'this toy compiler only supports the type integer');
    }
    names.forEach(function (n) {
        var initValue = (type === 'integer') ? 0 : false;
        symbols[n] = type;
    });
    names.forEach(function (n) {
        emitter.emit("(local $" + n + " i32)");
    });
}
// <statement> ::= <simple statement> | <structured statement>
function statement() {
    if (lexer_1.context.currentToken === 'begin' || lexer_1.context.currentToken === 'if' || lexer_1.context.currentToken === 'while') {
        structuredStatement();
    }
    else {
        simpleStatement();
        emitter.emit("");
    }
}
// <structured statement> ::= <compound statement> | <if statement> | <while statement>
function structuredStatement() {
    if (lexer_1.context.currentToken === 'if') {
        ifStatement();
    }
    else if (lexer_1.context.currentToken === 'while') {
        whileStatement();
    }
    else {
        compoundStatement();
    }
}
// <while statement> ::=	while <expression> do <statement>
function whileStatement() {
    match('while');
    emitter.emit("(block (loop");
    emitter.incIndent();
    var e = expression();
    emitter.emit("i32.eqz");
    emitter.emit("br_if 1");
    emitter.emit("");
    match('do');
    statement();
    emitter.emit("br 0");
    emitter.decIndent();
    emitter.emit("))");
}
// <if statement> ::= if <expression> then <statement> 
//                    | if <expression> then <statement> else <statement>
function ifStatement() {
    match('if');
    var e = expression();
    match('then');
    emitter.emit("(if");
    emitter.incIndent();
    emitter.emit("(then");
    emitter.incIndent();
    statement();
    emitter.decIndent();
    emitter.emit(")");
    if (lexer_1.context.currentToken === 'else') {
        match('else');
        emitter.emit("(else");
        emitter.incIndent();
        statement();
        emitter.decIndent();
        emitter.emit(")");
    }
    emitter.decIndent();
    emitter.emit(")");
}
// <compound statement> ::=	begin <statement>{ ; <statement> } end
function compoundStatement() {
    match('begin');
    statement();
    match(';');
    while (lexer_1.context.currentToken !== 'end') {
        statement();
        match(';');
    }
    match('end');
}
// <simple statement> ::= <assignment statement> | <write statement>
function simpleStatement() {
    if (lexer_1.context.currentToken === 'write') {
        writeStatement();
        emitter.emit("");
    }
    else {
        assignmentStatement();
    }
}
// <write statement> ::= write ( <expression> { , <expression> } )
function writeStatement() {
    match('write');
    match('(');
    var e = expression();
    emitter.emit("call $log");
    while (lexer_1.context.currentToken === ',') {
        match(',');
        e = expression();
        emitter.emit("call $log");
    }
    match(')');
}
// <assignment statement> ::= <variable> := <expression>
function assignmentStatement() {
    var varName = variable();
    if (!symbols[varName])
        throw new Error('unknown variable ' + varName);
    match(':=');
    var val = expression();
    writeVariable(varName, val);
}
// <expression> ::=	<simple expression>  
//                  | <simple expression> <relational operator> <simple expression>
function expression() {
    simpleExpression();
    if (!isRelationalOperator())
        return;
    var op = lexer_1.context.currentToken;
    lexer_1.readToken();
    simpleExpression();
    switch (op) {
        case '=': {
            emitter.emit("i32.eq");
            break;
        }
        case '<': {
            emitter.emit("i32.lt_s");
            break;
        }
        case '>': {
            emitter.emit("i32.gt_s");
            break;
        }
        case '>=': {
            emitter.emit("i32.ge_s");
            break;
        }
        case '<=': {
            emitter.emit("i32.le_s");
            break;
        }
        case '<>': {
            emitter.emit("i32.ne");
            break;
        }
        default: throw new Error('unknown operator ' + op);
    }
}
// <expression> ::=	<sign> <term> { <adding operator> <term> }
function simpleExpression() {
    term();
    while (lexer_1.context.currentToken === '+' || lexer_1.context.currentToken === '-' || lexer_1.context.currentToken === 'or') {
        var op = addingOperator();
        term();
        if (op === '+') {
            emitter.emit("i32.add");
        }
        else if (op === '-') {
            emitter.emit("i32.sub");
        }
        else {
            emitter.emit("i32.or");
        }
    }
}
// <adding operator> ::= + | - | or
function addingOperator() {
    if (lexer_1.context.currentToken === '+') {
        match('+');
        return '+';
    }
    else if (lexer_1.context.currentToken === '-') {
        match('-');
        return '-';
    }
    else if (lexer_1.context.currentToken === 'or') {
        match('or');
        return 'or';
    }
    else {
        lexer_1.expected('one of: +, -, or');
    }
}
// <multiplying operator> ::= * | div | and
function mulOperator() {
    if (lexer_1.context.currentToken === '*') {
        match('*');
        return '*';
    }
    else if (lexer_1.context.currentToken === '/' || lexer_1.context.currentToken === 'div') {
        match('/');
        return '/';
    }
    else if (lexer_1.context.currentToken === 'and') {
        match('and');
        return 'and';
    }
    else {
        lexer_1.expected('one of: *, /, div, and');
    }
}
// <term> ::= <factor> { <multiplying operator> <factor> }
function term() {
    factor();
    while (lexer_1.context.currentToken === '*' || lexer_1.context.currentToken === '/' || lexer_1.context.currentToken === 'and') {
        var op = mulOperator();
        factor();
        if (op === '*') {
            emitter.emit("i32.mul");
        }
        else if (op === '/') {
            emitter.emit("i32.div_s");
        }
        else {
            emitter.emit("i32.and");
        }
    }
}
// <factor> ::=	<digit> | ( <expression> )
function factor() {
    if (lexer_1.context.currentToken === 'not') {
        match('not');
        factor();
        emitter.emit("i32.eqz");
    }
    else if (lexer_1.context.currentToken === '(') {
        match('(');
        expression();
        match(')');
    }
    else if (lexer_1.context.tokenType === 'identifier') {
        if (!symbols[lexer_1.context.currentToken]) {
            throw new Error('unkown variable ' + lexer_1.context.currentToken);
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
    emitter.emit("get_local $" + lexer_1.context.currentToken);
    lexer_1.readToken();
}
function writeVariable(variable, value) {
    emitter.emit("set_local $" + variable);
}
function matchIdentifier() {
    if (lexer_1.context.tokenType !== 'identifier') {
        lexer_1.expected('IDENTIFIER');
    }
    var result = lexer_1.context.currentToken;
    lexer_1.readToken();
    return result;
}
function variable() {
    return identifier();
}
function identifier() {
    if (lexer_1.context.tokenType !== 'identifier') {
        lexer_1.expected('IDENTIFIER');
    }
    var result = lexer_1.context.currentToken;
    lexer_1.readToken();
    return result;
}
function parseStatement(s) {
    lexer_1.init(s);
    statement();
}
exports.parseStatement = parseStatement;
function match(s) {
    if (s === lexer_1.context.currentToken) {
        lexer_1.readToken();
    }
    else {
        lexer_1.expected(s);
    }
}
function number() {
    if (lexer_1.context.tokenType !== 'integer constant')
        lexer_1.expected('Number');
    emitter.emit("i32.const " + lexer_1.context.currentToken);
    lexer_1.readToken();
}
function isRelationalOperator() {
    var operators = ['=', '<', '>', '<=', '>=', '<>'];
    return operators.indexOf(lexer_1.context.currentToken) !== -1;
}
function parseProgram(s) {
    lexer_1.init(s);
    program();
    if (emitter instanceof emitter_1.StringEmitter) {
        return emitter.output;
    }
    else {
        return null;
    }
}
exports.parseProgram = parseProgram;
//# sourceMappingURL=compiler.js.map