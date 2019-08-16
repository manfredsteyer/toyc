"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var initialContext = {
    current: null,
    currentToken: null,
    tokenType: null,
    nextPosition: 0,
    input: '',
    line: 1,
    column: 0,
};
exports.context = __assign({}, initialContext);
function init(input) {
    exports.context = __assign({}, initialContext, { input: input });
    readNext();
    readToken();
}
exports.init = init;
function isEOF(s) {
    return s === '';
}
function isDigit(s) {
    return s.match(/\d/);
}
function isAlpha(s) {
    return s.match(/[A-Za-z]/);
}
function isSpecialChar(s) {
    return !isDigit(s) && !isAlpha(s) && !isWhitespace(s) && !isEOF(s);
}
function isWhitespace(c) {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
}
function readNext() {
    if (exports.context.nextPosition === exports.context.input.length) {
        exports.context.current = '';
        return '';
    }
    exports.context.current = exports.context.input.substr(exports.context.nextPosition, 1);
    exports.context.nextPosition++;
    if (exports.context.current === '\n') {
        exports.context.column = 0;
        exports.context.line++;
    }
    else if (exports.context.current !== '\r') {
        exports.context.column++;
    }
    return exports.context.current;
}
function readToken() {
    var buffer = '';
    if (exports.context.current === '') {
        exports.context.currentToken = '';
        exports.context.tokenType = 'EOF';
        return exports.context.currentToken;
    }
    var inComment = exports.context.current === '{';
    while (exports.context.current !== '' && (inComment || isWhitespace(exports.context.current))) {
        if (exports.context.current === '}') {
            inComment = false;
        }
        readNext();
        if (exports.context.current === '{') {
            inComment = true;
        }
    }
    if (inComment) {
        throw new Error('Program terminated but comment was not closed.');
    }
    if (isSpecialChar(exports.context.current)) {
        while (isSpecialChar(exports.context.current)) {
            if (buffer !== '' && exports.context.current === ';')
                break;
            if (buffer !== '' && exports.context.current === ')')
                break;
            if (buffer === ')')
                break;
            if (buffer === '}')
                break;
            buffer += exports.context.current;
            readNext();
        }
        if (types_1.SPECIAL_SYMBOLS.indexOf(buffer) === -1) {
            unexpected(buffer);
        }
        exports.context.tokenType = 'special symbol';
        exports.context.currentToken = buffer;
        return exports.context.currentToken;
    }
    if (isDigit(exports.context.current)) {
        while (isDigit(exports.context.current)) {
            buffer += exports.context.current;
            readNext();
        }
        if (isAlpha(exports.context.current)) {
            expected('digit or operator');
        }
        exports.context.currentToken = buffer;
        exports.context.tokenType = 'integer constant';
        return exports.context.currentToken;
    }
    if (isAlpha(exports.context.current)) {
        while (isAlpha(exports.context.current) || isDigit(exports.context.current)) {
            buffer += exports.context.current;
            readNext();
        }
        exports.context.currentToken = buffer;
        if (types_1.SPECIAL_SYMBOLS.indexOf(buffer) > -1) {
            exports.context.tokenType = 'special symbol';
        }
        else {
            exports.context.tokenType = 'identifier';
        }
        return exports.context.currentToken;
    }
}
exports.readToken = readToken;
function expected(s, info) {
    var err = s + " expected between line " + exports.context.line + ", column " + exports.context.column + " (position " + (exports.context.nextPosition - 1) + ") and the token before\n"
        + exports.context.currentToken + ' is not allowed here.';
    if (info) {
        err += '\nINFO: ' + info;
    }
    throw new Error(err);
}
exports.expected = expected;
function unexpected(found) {
    var err = "unexpected token " + found + " at line " + exports.context.line + ", column " + exports.context.column + " (position " + (exports.context.nextPosition - 1) + ")";
    throw new Error(err);
}
exports.unexpected = unexpected;
//# sourceMappingURL=lexer.js.map