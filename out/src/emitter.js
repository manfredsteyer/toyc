"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConsoleEmitter = /** @class */ (function () {
    function ConsoleEmitter() {
        this.indent = '';
    }
    ConsoleEmitter.prototype.incIndent = function () {
        this.indent += '\t';
    };
    ConsoleEmitter.prototype.decIndent = function () {
        if (this.indent) {
            this.indent = this.indent.substr(0, this.indent.length - 1);
        }
    };
    ConsoleEmitter.prototype.emit = function (line) {
        if (!line)
            line = ';;';
        line = line.replace('\n', '\n' + this.indent);
        console.info(this.indent + line);
    };
    ConsoleEmitter.prototype.reset = function () {
        this.indent = '';
    };
    return ConsoleEmitter;
}());
exports.ConsoleEmitter = ConsoleEmitter;
var StringEmitter = /** @class */ (function () {
    function StringEmitter() {
        this.output = '';
        this.indent = '';
    }
    StringEmitter.prototype.incIndent = function () {
        this.indent += '\t';
    };
    StringEmitter.prototype.decIndent = function () {
        if (this.indent) {
            this.indent = this.indent.substr(0, this.indent.length - 1);
        }
    };
    StringEmitter.prototype.emit = function (line) {
        if (!line)
            line = ';;';
        line = line.replace('\n', '\n' + this.indent);
        this.output += this.indent + line + '\n';
    };
    StringEmitter.prototype.reset = function () {
        this.indent = '';
        this.output = '';
    };
    return StringEmitter;
}());
exports.StringEmitter = StringEmitter;
//# sourceMappingURL=emitter.js.map