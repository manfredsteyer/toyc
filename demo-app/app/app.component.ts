import { Component, AfterContentInit, AfterViewInit } from '@angular/core';
import { parseProgram } from '../../index'
import { sampleProgram } from './sample-program';

declare const WabtModule: any;
declare const WebAssembly: any;

@Component({
  selector: 'app-root',
  template: `

    <body>
    <div class="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
      <h5 class="my-0 mr-md-auto font-weight-normal">ToyCompiler Pascal->WebAssembly</h5>
      <nav class="my-2 my-md-0 mr-md-3">
      <span class="start">
      »<a class="p-2 text-dark start" href="javascript:void(0)" (click)="compileAndRun()">Compile & Run</a>
      </span>
        <a class="p-2 text-dark" href="https://github.com/manfredsteyer/toyc/blob/master/readme.md">Credits</a>
        <a class="p-2 text-dark" href="https://github.com/manfredsteyer/toyc">Code</a>
      </nav>
    </div>

    <div class="fluent-container" style="padding:20px">
      <div class="row">
        <div class="col-md-6">
          <textarea spellcheck="false" id="pascal" [(ngModel)]="pascal" style="width:100%;height:500px"></textarea>
        </div>
        <div class="col-md-4">
          <textarea spellcheck="false" [(ngModel)]="wat" style="width:100%; height:500px"></textarea>
        </div>
        <div class="col-md-2">
          <textarea spellcheck="false" [(ngModel)]="result" style="width:100%; height:500px"></textarea>
        </div>
      </div>
    </div>
    </body>
    
  `,
  styles: [`
    .start {
      color: green!important;
      font-weight:bold;
    }

    textarea{
      background: url(http://i.imgur.com/2cOaJ.png);
      background-attachment: local;
      background-repeat: no-repeat;
      padding-left: 35px;
      padding-top: 10px;
      border-color: #ccc;
      font-family: monospace;
      font-size: 12px;
      line-height: 16px;
    }

  `]
})
export class AppComponent implements AfterViewInit {

  pascal = sampleProgram;
  wat = '';
  result = '';

  ngAfterViewInit(): void {
  }

  compileAndRun() {

    try {
      this.wat = parseProgram(this.pascal);
    }
    catch(e) {
      this.wat = e.toString();
    }

    WabtModule().then(wabt => {
  
      var binaryOutput;
      var binaryBuffer = null;
      var that = this;

      const importsMap = {
        "console": {
          "log": function(s) {
            console.debug(s);
            that.result += s + '\n';
          }
        }
      }

      try {

        this.result = '';

        var module = wabt.parseWat('test.wast', this.wat, {});
        module.resolveNames();
        module.validate({});

        var binaryOutput = module.toBinary({ log: true, write_debug_names: true });
        console.debug(binaryOutput.log);
        binaryBuffer = binaryOutput.buffer;
  
        const wasmModule = new WebAssembly.Module(binaryBuffer);
        const wasmInstance = new WebAssembly.Instance(wasmModule, importsMap);
        wasmInstance.exports.main();
  
      } catch (e) {
        console.error(e.toString());
  
      } finally {
        if (module) module.destroy();
      }
    });
  }

}
