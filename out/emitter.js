"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Emitter = /** @class */ (function () {
    function Emitter() {
        this.indent = '';
    }
    Emitter.prototype.incIndent = function () {
        this.indent += '\t';
    };
    Emitter.prototype.decIndent = function () {
        if (this.indent) {
            this.indent = this.indent.substr(0, this.indent.length - 1);
        }
    };
    Emitter.prototype.emit = function (line) {
        if (!line)
            line = ';;';
        line = line.replace('\n', '\n' + this.indent);
        console.info(this.indent + line);
    };
    return Emitter;
}());
exports.Emitter = Emitter;
//# sourceMappingURL=emitter.js.map