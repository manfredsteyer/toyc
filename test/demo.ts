import { parseProgram } from "../src/compiler";

const result = parseProgram(`
    { 
        Sample program for displaying hotel rooms.

        Shows the pascal features implemented by this toy compiler
    }
    program myProgram;
    var 
        x: integer;     { only integer supported }
        y: integer;
        bla : integer;
    begin

        x := 1;
        while x < 30 do
        begin

            { don't forget to put those parts into parenthesizes }
            { 
                Pascal demands them; this toy compiler does current NOT 
                check for them and hence emit wrong code 
            }
            if (x < 10) and (x <> 7) then
            begin
                write(x);
            end
            else
            begin

                y := 100 + x - 10;

                { one more time: don't forget the parenthesizes }
                if not ( (y - 100 = 13) or (y-100=7) ) and ( x > 10 ) then
                begin
                    write(y);
                end;

            end;

            x := x + 1;
        end;

        { 
            calc hotel room price for 
            2 nights one person + 1 night a 2nd person
        }

        x := 120;
        x := x * (2 + 1);
        write(x);

    end;
`);

console.info(result);