export class Emitter {

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

}