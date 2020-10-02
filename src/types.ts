export type TokenType = 'EOF' | 'special symbol' | 'integer constant' | 'identifier';

export type DataType = 'integer' /*| 'Boolean' | 'boolean' */;

export const SPECIAL_SYMBOLS = [
    '+', '-', '*', '=', '(', ')', '[', ']', '.', ',', ';', '>', '<', '>=', '<=', '<>', ':', ':=', '/',
    'and', 'or', 'div', 'not', 'if', 'then', 'else', 'of', 'while', 'do', 'begin', 'end', 'read', 'write',
    'var', 'array', 'procedure', 'program', 'function', 'true', 'false'
];

export interface ContextType {
    current: string;
    tokenType: TokenType;
    currentToken: string;
    nextPosition: number;
    input: string;
    line: number;
    column: number;
}

export interface Emitter {
    reset();
    incIndent();
    decIndent();
    emit(s: string);
}
