"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_1 = require("../src/compiler");
var result = compiler_1.parseProgram("\n    { \n        Sample program for displaying hotel rooms.\n\n        Shows the pascal features implemented by this toy compiler\n    }\n    program myProgram;\n    var \n        x: integer;     { only integer supported }\n        y: integer;\n        bla : integer;\n    begin\n\n        x := 1;\n        while x < 30 do\n        begin\n\n            { don't forget to put those parts into parenthesizes }\n            { \n                Pascal demands them; this toy compiler does current NOT \n                check for them and hence emit wrong code \n            }\n            if (x < 10) and (x <> 7) then\n            begin\n                write(x);\n            end\n            else\n            begin\n\n                y := 100 + x - 10;\n\n                { one more time: don't forget the parenthesizes }\n                if not ( (y - 100 = 13) or (y-100=7) ) and ( x > 10 ) then\n                begin\n                    write(y);\n                end;\n\n            end;\n\n            x := x + 1;\n        end;\n\n        { \n            calc hotel room price for \n            2 nights one person + 1 night a 2nd person\n        }\n\n        x := 120;\n        x := x * (2 + 1);\n        write(x);\n\n    end;\n");
console.info(result);
var expected = "(module \n\t(import \"console\" \"log\" (func $log (param i32)))\n\t(func $myProgram\n\t\t;;\n\t\t(local $x i32)\n\t\t(local $y i32)\n\t\t(local $bla i32)\n\t\t;;\n\t\ti32.const 1\n\t\tset_local $x\n\t\t;;\n\t\t(block (loop\n\t\t\tget_local $x\n\t\t\ti32.const 30\n\t\t\ti32.lt_s\n\t\t\ti32.eqz\n\t\t\tbr_if 1\n\t\t\t;;\n\t\t\tget_local $x\n\t\t\ti32.const 10\n\t\t\ti32.lt_s\n\t\t\tget_local $x\n\t\t\ti32.const 7\n\t\t\ti32.ne\n\t\t\ti32.and\n\t\t\t(if\n\t\t\t\t(then\n\t\t\t\t\tget_local $x\n\t\t\t\t\tcall $log\n\t\t\t\t\t;;\n\t\t\t\t\t;;\n\t\t\t\t)\n\t\t\t\t(else\n\t\t\t\t\ti32.const 100\n\t\t\t\t\tget_local $x\n\t\t\t\t\ti32.add\n\t\t\t\t\ti32.const 10\n\t\t\t\t\ti32.sub\n\t\t\t\t\tset_local $y\n\t\t\t\t\t;;\n\t\t\t\t\tget_local $y\n\t\t\t\t\ti32.const 100\n\t\t\t\t\ti32.sub\n\t\t\t\t\ti32.const 13\n\t\t\t\t\ti32.eq\n\t\t\t\t\tget_local $y\n\t\t\t\t\ti32.const 100\n\t\t\t\t\ti32.sub\n\t\t\t\t\ti32.const 7\n\t\t\t\t\ti32.eq\n\t\t\t\t\ti32.or\n\t\t\t\t\ti32.eqz\n\t\t\t\t\tget_local $x\n\t\t\t\t\ti32.const 10\n\t\t\t\t\ti32.gt_s\n\t\t\t\t\ti32.and\n\t\t\t\t\t(if\n\t\t\t\t\t\t(then\n\t\t\t\t\t\t\tget_local $y\n\t\t\t\t\t\t\tcall $log\n\t\t\t\t\t\t\t;;\n\t\t\t\t\t\t\t;;\n\t\t\t\t\t\t)\n\t\t\t\t\t)\n\t\t\t\t)\n\t\t\t)\n\t\t\tget_local $x\n\t\t\ti32.const 1\n\t\t\ti32.add\n\t\t\tset_local $x\n\t\t\t;;\n\t\t\tbr 0\n\t\t))\n\t\ti32.const 120\n\t\tset_local $x\n\t\t;;\n\t\tget_local $x\n\t\ti32.const 2\n\t\ti32.const 1\n\t\ti32.add\n\t\ti32.mul\n\t\tset_local $x\n\t\t;;\n\t\tget_local $x\n\t\tcall $log\n\t\t;;\n\t\t;;\n\t)\n\t(export \"main\" (func $myProgram))\n)\n";
console.assert(result === expected, 'Unexpected result!');
//# sourceMappingURL=test.js.map