import { SPECIAL_SYMBOLS, ContextType } from './types';

const initialContext: ContextType = {
    current: null,
    currentToken: null,
    tokenType: null,
    nextPosition: 0,
    input: '',
    line: 1,
    column: 0,
}

export let context: ContextType = {...initialContext};

export function init(input: string) {
    context = {...initialContext, input};
    readNext();
    readToken();
}

function isEOF(s: string) {
    return s === '';
}

function isDigit(s: string) {
    return s.match(/\d/);
}

function isAlpha(s: string) {
    return s.match(/[A-Za-z]/);
}

function isSpecialChar(s: string) {
    return !isDigit(s) && !isAlpha(s) && !isWhitespace(s) && !isEOF(s);
}

function isWhitespace(c: string) {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
}

function readNext() {
    if (context.nextPosition === context.input.length) {
        context.current = '';
        return '';
    }

    context.current = context.input.substr(context.nextPosition, 1);
    context.nextPosition++;

    if (context.current === '\n') {
        context.column = 0;
        context.line++;
    }
    else if (context.current !== '\r') {
        context.column++;
    }

    return context.current;

}

export function readToken() {
    let buffer = '';

    if (context.current === '') {
        context.currentToken = '';
        context.tokenType = 'EOF';
        return context.currentToken;
    }

    let inComment = context.current === '{';

    while (context.current !== '' && (inComment || isWhitespace(context.current))) {
        if (context.current === '}') {
            inComment = false;            
        }
        readNext();
        if (context.current === '{') {
            inComment = true;
        }
    }

    if (inComment) {
        throw new Error('Program terminated but comment was not closed.');
    }

    if (isSpecialChar(context.current)) {
        while (isSpecialChar(context.current)) {
            if (buffer !== '' && context.current === ';') break;
            if (buffer !== '' && context.current === ')') break;
            if (buffer === ')' ) break;
            if (buffer === '}' ) break;

            buffer += context.current;
            readNext();
        }

        if (SPECIAL_SYMBOLS.indexOf(buffer) === -1) {
            unexpected(buffer);
        }

        context.tokenType = 'special symbol';
        context.currentToken = buffer;
        return context.currentToken;
    }

    if (isDigit(context.current)) {
        while (isDigit(context.current)) {
            buffer += context.current;
            readNext();
        }
        if (isAlpha(context.current)) {
            expected('digit or operator');
        }
        context.currentToken = buffer;
        context.tokenType = 'integer constant';
        return context.currentToken
    }

    if (isAlpha(context.current)) {
        while (isAlpha(context.current) || isDigit(context.current)) {
            buffer += context.current;
            readNext();
        }

        context.currentToken = buffer;
        if (SPECIAL_SYMBOLS.indexOf(buffer) > -1) {
            context.tokenType = 'special symbol';
        }
        else {
            context.tokenType = 'identifier'
        }
        return context.currentToken;

    }

}

export function expected(s: string, info?: string) {
    let err = `${s} expected between line ${context.line}, column ${context.column} (position ${Math.max(context.nextPosition - 1, 0)}) and the token before. The token '${context.currentToken}' is not allowed here.`;

    if (info) {
        err += '; INFO: ' + info;
    }
    throw new Error(err);
}

export function unexpected(found?: string) {
    let err = `unexpected token ${found} at line ${context.line}, column ${context.column} (position ${context.nextPosition - 1})`;
  
    throw new Error(err);
}

export function error(error: string) {
    let err = `${error} at line ${context.line}, column ${context.column} (position ${context.nextPosition - 1})`;
  
    throw new Error(err);
}