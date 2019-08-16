# Toy Pascal->WebAssembly Compiler

This is a fun project indented for learning and not for production. It contains a hand-written top-down compiler which converts a subset of MiniPascal to Web Assembly Text Format (wat). The used [grammar](./grammar) can be found here.

## Credits

- [Grammar for MiniPascal](https://www.cs.helsinki.fi/u/vihavain/k10/okk/minipascal/minipascalsyntax.html)
  - [Used Subset](./grammar)
- [Stanford course on compilers](http://web.stanford.edu/class/cs143/index2018.html)
- [Practical tutorial on compilers](https://compilers.iecc.com/crenshaw/)
- [Web Assembly documentation](https://webassembly.org/docs/semantics/)
  - The interactive demo application uses libwabt.js script from this page which is under [Apache Licese 2.0](https://github.com/WebAssembly/website/blob/master/LICENSE)
- [MDN doc about web assembly test format](https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format)
- [Writing Web Assembly By Hand](https://blog.scottlogic.com/2018/04/26/webassembly-by-hand.html)
- [WebAssembly Studio](https://webassembly.studio/)
  - Great online editor for WebAssembly
