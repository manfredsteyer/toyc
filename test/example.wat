(module
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
	)
	(export "main" (func $myProgram))
)
