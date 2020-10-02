export const sampleProgram = `{ 
    **Press 'Compile & Run'** (top right corner) to start this application!
}
program myProgram;
var 
    year: integer;     { only supported data type: integer}
    stop: integer;
begin

    year := §MMXX;     { roman numbers are prefixed with a § }
                       { this feature was added to honor ngRome 2020 }
    
    stop := year + 1000;

    while year <= stop do { support contol structurs: while, if }
    begin
      writeRoman(year); 
      write(year); 
      year := year + 1;
    end;

end;
`