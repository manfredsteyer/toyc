"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.pascal = '';
        this.wat = '';
        this.result = '';
    }
    AppComponent.prototype.compile = function () {
        var _this = this;
        WabtModule().then(function (wabt) {
            var binaryOutput;
            var binaryBuffer = null;
            var that = _this;
            var importsMap = {
                "console": {
                    "log": function (s) {
                        console.debug(s);
                        that.result += s + '\n';
                    }
                }
            };
            try {
                _this.result = '';
                var module = wabt.parseWat('test.wast', _this.wat, {});
                module.resolveNames();
                module.validate({});
                var binaryOutput = module.toBinary({ log: true, write_debug_names: true });
                console.debug(binaryOutput.log);
                binaryBuffer = binaryOutput.buffer;
                var wasmModule = new WebAssembly.Module(binaryBuffer);
                var wasmInstance = new WebAssembly.Instance(wasmModule, importsMap);
                wasmInstance.exports.main();
            }
            catch (e) {
                console.error(e.toString());
            }
            finally {
                if (module)
                    module.destroy();
            }
        });
    };
    AppComponent.prototype.run = function () {
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            template: "\n\n    <body>\n    <div class=\"d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm\">\n      <h5 class=\"my-0 mr-md-auto font-weight-normal\">ToyCompiler Pascal->WebAssembly</h5>\n      <nav class=\"my-2 my-md-0 mr-md-3\">\n      \u00BB<a class=\"p-2 text-dark\" href=\"javascript:void(0)\" (click)=\"compile()\" style=\"font-weight:bold\">Compile</a>\n      \u00BB<a class=\"p-2 text-dark\" href=\"javascript:void(0)\" (click)=\"run()\" style=\"font-weight:bold\">Run</a>\n        <a class=\"p-2 text-dark\" href=\"https://github.com/manfredsteyer/toyc/blob/master/readme.md\">Credits</a>\n        <a class=\"p-2 text-dark\" href=\"https://github.com/manfredsteyer/toyc\">Code</a>\n      </nav>\n    </div>\n\n    <div class=\"fluent-container\" style=\"padding:20px\">\n      <div class=\"row\">\n        <div class=\"col-md-6\">\n          <textarea [(ngModel)]=\"pascal\" style=\"width:100%;height:500px\"></textarea>\n        </div>\n        <div class=\"col-md-4\">\n          <textarea [(ngModel)]=\"wat\" style=\"width:100%; height:500px\"></textarea>\n        </div>\n        <div class=\"col-md-2\">\n          <textarea [(ngModel)]=\"result\" style=\"width:100%; height:500px\"></textarea>\n        </div>\n      </div>\n    </div>\n    </body>\n    \n  ",
            styles: ["\n    a.hand { cursor: hand }\n  "]
        })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map