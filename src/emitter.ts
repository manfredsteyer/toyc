import { Emitter } from "./types";

export class ConsoleEmitter implements Emitter {

    private indent: string = '';

    incIndent() {
        this.indent += '\t';
    }

    decIndent() {
        if (this.indent) {
            this.indent = this.indent.substr(0, this.indent.length-1);
        }
    }

    emit(line: string) {
        if (!line) line = ';;';
        line = line.replace('\n', '\n' + this.indent);
        console.info(this.indent + line);
    }

    reset() {
        this.indent = '';
    }

}

export class StringEmitter implements Emitter {

    public output: string = '';
    private indent: string = '';

    incIndent() {
        this.indent += '    ';
    }

    decIndent() {
        if (this.indent) {
            this.indent = this.indent.substr(0, this.indent.length-4);
        }
    }

    emit(line: string) {
        if (!line) line = '';
        line = line.replace('\n', '\n' + this.indent);
        this.output += this.indent + line + '\n';
    }

    reset() {
        this.indent = '';
        this.output = '';
    }

}