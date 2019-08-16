"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_1 = require("../src/compiler");
compiler_1.parseProgram("\n    { \n        Sample program for displaying hotel rooms.\n\n        Shows the pascal features implemented by this toy compiler\n    }\n    program myProgram;\n    var \n        x: integer;     { only integer supported }\n        y: integer;\n        bla : integer;\n    begin\n\n        x := 1;\n        while x < 30 do\n        begin\n\n            { don't forget to put those parts into parenthesizes }\n            { \n                Pascal demands them; this toy compiler does current NOT \n                check for them and hence emit wrong code \n            }\n            if (x < 10) and (x <> 7) then\n            begin\n                write(x);\n            end\n            else\n            begin\n\n                y := 100 + x - 10;\n\n                { one more time: don't forget the parenthesizes }\n                if not ( (y - 100 = 13) or (y-100=7) ) and ( x > 10 ) then\n                begin\n                    write(y);\n                end;\n\n            end;\n\n            x := x + 1;\n        end;\n\n        { \n            calc hotel room price for \n            2 nights one person + 1 night a 2nd person\n        }\n\n        x := 120;\n        x := x * (2 + 1);\n        write(x);\n\n    end;\n");
//# sourceMappingURL=demo.js.map