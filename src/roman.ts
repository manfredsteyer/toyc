/*
 * To honor ngRome 2020, I've added support for roman numbers
*/

// Taken from: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-22.php

export function romanToInt(str1) {
    if(str1 == null) return -1;
    var num = char_to_int(str1.charAt(0));
    var pre, curr;
    
    for(var i = 1; i < str1.length; i++){
    curr = char_to_int(str1.charAt(i));
    pre = char_to_int(str1.charAt(i-1));
    if(curr <= pre){
    num += curr;
    } else {
    num = num - pre*2 + curr;
    }
    }
    
    return num;
    }
    
    function char_to_int(c){
    switch (c){
    case 'I': return 1;
    case 'V': return 5;
    case 'X': return 10;
    case 'L': return 50;
    case 'C': return 100;
    case 'D': return 500;
    case 'M': return 1000;
    default: throw new Error(`${c} is not a valid part of a roman number`);
    }
    }
   
    