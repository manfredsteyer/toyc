# Grammar

The Grammar for this toy compiler is a **subset** of the MiniPascal Grammer which was taken from [here](https://www.cs.helsinki.fi/u/vihavain/k10/okk/minipascal/minipascalsyntax.html).

# Production Rules

```
<program> ::=	program <identifier> ; <block> .
<block> ::=	<variable declaration part> 
            <procedure declaration part> 
            <statement part>

<variable declaration part> ::=	<empty> | 
                                var <variable declaration> ; { <variable declaration> ; }

<variable declaration> ::=	<identifier > { , <identifier> } : <type>
<type> ::=	<identifier>

<statement part> ::= <compound statement>
<compound statement> ::= begin <statement>{ ; <statement> } end
<statement> ::=	<simple statement> | <structured statement>
<simple statement> ::=	<assignment statement> | <procedure statement> | <write statement>
<assignment statement> ::=	<variable> := <expression>
<write statement> ::=	write ( <expression> { , <expression> } )

<structured statement> ::=	<compound statement> | <if statement> | <while statement>
<if statement> ::=	if <expression> then <statement> | 
                    if <expression> then <statement> else <statement>
<while statement> ::=	while <expression> do <statement>

<expression> ::=	<simple expression> | 
                    <simple expression> <relational operator> <simple expression>
<simple expression> ::=	<sign> <term> { <adding operator> <term> }
<term> ::=	<factor> { <multiplying operator> <factor> }
<factor> ::= <variable> | <constant> | ( <expression> ) | not <factor>
<relational operator> ::=	= | <> | < | <= | >= | >
<sign> ::=	+ | - | <empty>
<adding operator> ::=	+ | - | or
<multiplying operator> ::=	* | div | and
<variable> ::=	<identifier>
```

# Lexical grammar

```
<constant> ::=	<integer constant> 
<identifier> ::=	<letter> { <letter or digit> }
<letter or digit> ::=	<letter> | <digit>
<integer constant> ::=	<digit> { <digit> }
<letter> ::=	a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | 
p | q | r | s | t | u | v | w | x | y | z | A | B | C | 
D | E | F | G | H | I | J | K | L | M | N | O | P 
| Q | R | S | T | U | V | W | X | Y | Z
<digit> ::=	0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
<special symbol> ::=	+ | - | * | = | <> | < | > | <= | >= | 
( | ) | [ | ] | := | . | , | ; | : | .. | div | or | 
and | not | if | then | else | of | while | do | 
begin | end | read | write | var | array | 
procedure | program
```