"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_1 = require("./src/compiler");
exports.parseProgram = compiler_1.parseProgram;
exports.setEmitter = compiler_1.setEmitter;
var lexer_1 = require("./src/lexer");
exports.init = lexer_1.init;
var emitter_1 = require("./src/emitter");
exports.ConsoleEmitter = emitter_1.ConsoleEmitter;
//# sourceMappingURL=index.js.map