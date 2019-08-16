"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context");
function expected(s, info) {
    var err = s + " expected between line " + context_1.context.line + ", column " + context_1.context.column + " (position " + (context_1.context.nextPosition - 1) + ") and the token before\n"
        + context_1.context.currentToken + ' is not allowed here.';
    if (info) {
        err += '\nINFO: ' + info;
    }
    throw new Error(err);
}
exports.expected = expected;
function unexpected(found) {
    var err = "unexpected token " + found + " at line " + context_1.context.line + ", column " + context_1.context.column + " (position " + (context_1.context.nextPosition - 1) + ")";
    throw new Error(err);
}
exports.unexpected = unexpected;
//# sourceMappingURL=error.js.map