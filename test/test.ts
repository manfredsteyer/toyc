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

const expected = `(module 
	(import "console" "log" (func $log (param i32)))
	(func $myProgram
		;;
		(local $x i32)
		(local $y i32)
		(local $bla i32)
		;;
		i32.const 1
		set_local $x
		;;
		(block (loop
			get_local $x
			i32.const 30
			i32.lt_s
			i32.eqz
			br_if 1
			;;
			get_local $x
			i32.const 10
			i32.lt_s
			get_local $x
			i32.const 7
			i32.ne
			i32.and
			(if
				(then
					get_local $x
					call $log
					;;
					;;
				)
				(else
					i32.const 100
					get_local $x
					i32.add
					i32.const 10
					i32.sub
					set_local $y
					;;
					get_local $y
					i32.const 100
					i32.sub
					i32.const 13
					i32.eq
					get_local $y
					i32.const 100
					i32.sub
					i32.const 7
					i32.eq
					i32.or
					i32.eqz
					get_local $x
					i32.const 10
					i32.gt_s
					i32.and
					(if
						(then
							get_local $y
							call $log
							;;
							;;
						)
					)
				)
			)
			get_local $x
			i32.const 1
			i32.add
			set_local $x
			;;
			br 0
		))
		i32.const 120
		set_local $x
		;;
		get_local $x
		i32.const 2
		i32.const 1
		i32.add
		i32.mul
		set_local $x
		;;
		get_local $x
		call $log
		;;
		;;
	)
	(export "main" (func $myProgram))
)
`

console.assert(result === expected, 'Unexpected result!');