console.log('hello tests');


function foo(name){
    console.log(this);
    console.log(foo.caller);
    console.log(name);
}

function printTime(func, ...args) {
    console.log('printTime start');
    // func(...args);
    foo.apply(this, args);
    console.log('printTime end');
}


// printTime(console.log, "hello", "apply")


class debug {
    static runAndPrintTime(func, ...params) {
        console.log('runAndPrintTime start');
        console.log(this);
        console.log(func);
        console.log(arguments);
        console.log(this.runAndPrintTime.call);
        console.log(Function.prototype.call);
        func.apply(game, params);

        console.log('runAndPrintTime end');
    }
}

// debug.runAndPrintTime(foo, "ffff");

class game {
    
    init() {
        console.log('init start');
        console.log(this);
        this.log();
        console.log('init end');
    }
    log(){
        console.log('log start');
        console.log('game');
        console.log('log end');
    }
    runTime(func ) {
        console.log('runTime start');
        func.bind(this).call();
        // this.log();
        console.log('runTime end');

    }
}

g = new game();
// g.init();
// debug.runAndPrintTime(g.init);
// debug.runAndPrintTime(g.init.bind(g));
// g.runTime(g.init);
g.init.bind(g).call();