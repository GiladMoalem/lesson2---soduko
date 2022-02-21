class Board{
    // arr = [];
    original_board = [];

    constructor(){
        this.arr = [];
        for (let index = 0; index < 81; index++) {
            this.arr[index] = 0;
        }
    }
    
    setNumberByIndex(index, number){
        if(number>9 || number<1) return false;
        if(index>80 || index<0) return false;
        this.arr[index] = number;
        return true;
    }
    
    setNumberByXY(x,y,number){
        return this.setNumberByIndex(this.#cordinatsToIndex(x,y) , number);
    }
    #cordinatsToIndex(x,y){ return x*9+y; }
    
    #indexToCordinats(index){
        let x = Math.floor(index / 9);
        let y = index % 9;
        return [x ,y];
    }

    isLeagle(index,num){
        let [i,j] = this.#indexToCordinats(index);

        if(num > 9 || num <1)  return false;
        for (let k = 0; k < 9; k++) {
            if(this.arr[this.#cordinatsToIndex(k,j)] == num) return false;
            if(this.arr[this.#cordinatsToIndex(i,k)] == num) return false;
        }
        let i2 = (Math.floor(i/3))*3;
        let j2 = Math.floor(j/3)*3;

        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if(this.arr[this.#cordinatsToIndex(i2+k, j2+l)] == num) return false;
            }
        }
        return true;
    }


    solve(){
        return this.solverRecursive(0);
    }
    
    solverRecursive(index){
        if(index == 81)
            return true;

        // let [i,j] = this.#indexToCordinats(index);

        if(this.arr[index] != 0){
            return this.solverRecursive(index+1);
        }
        
        for (let k = 1; k < 10; k++) {
            if(this.isLeagle(index,k)){
                this.arr[index] = k;
                if(this.solverRecursive(index+1))
                    return true;
            }
        }
        this.arr[index] = 0;
        return false;
    }
    
    initScreen(arr_screen){
        this.arr_screen = arr_screen;
    }

    updateScreen(){
        for (let index = 0; index < 81; index++) {
            if(this.arr[index] == 0){
                this.arr_screen[index].value = "";
            }
            else{
                this.arr_screen[index].value = this.arr[index];
            }
        }
        return true;
    }

    initFromScreen(){
        for (let index = 0; index < 81; index++) {
            this.arr[index] = this.arr_screen[index].value;
        }
    }
    
    initRandomBoard(count){
        // BEFORE USING THIS FUNCTION MAKE SURE THE ARRAY IS EMPTY!!
        // count have to be smaller then 82.
        while(count>0){
            let index = Math.floor (Math.random() * 8*8);
            
            while(this.arr[index] != 0){
                index = Math.floor (Math.random() * 8*8);
            }
            let number = Math.floor (Math.random()*9);
            while ( ! this.isLeagle (index, number)) {
                number = Math.floor (Math.random()*9);
            }
            this.arr[index] = number;
            count--;
        }

        //save the correct original board
        this.updateOriginalBoard();
    }

    updateOriginalBoard(){
        for (let index = 0; index < 81; index++) {
            this.original_board[index] =  this.arr[index];
        }
    }
    
    cleanBoard(){
        for (let index = 0; index < 81; index++) {
            this.arr[index] = 0;
            this.original_board[index] = 0;
        }
    }
};


let b = new Board();

// console.log(b.solve());
console.log(b)
b.initRandomBoard(10);
console.log(b.arr);

///////////////  FOR 5 SECOND WAIT ////////////////
function resolveAfter5Seconds(x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, 5000);
    });
  }
  
async function f1(){
    var x = await resolveAfter5Seconds();
    console.log(x); // 10
    
}
    

  f1();
  console.log("after")
///////////////////----------------------


let c1 = document.getElementById("cell-1");

c1.addEventListener('change', e=>{
    console.log(c1.value);
    
})



let screen_board = Array;
let name_cell = "cell-"
for (let index = 0; index < 81; index++) {
    let cell = name_cell+(index+1);
    screen_board[index] = document.getElementById(cell);
}

for (let index = 0; index < 81; index++) {
    screen_board[index].addEventListener('change',e=>{
        // if(screen_board[index].value != 0) {
        //     console.log(screen_board[index], "unclickable");
        //     screen_board[index].readOnly = true;
        //     return;
        // }
        console.log("change",screen_board[index], screen_board[index].value);
        b.initFromScreen();
        // arr[index] = e.value;
    });
}
b.initScreen(screen_board)
b.updateScreen();


//CLEAN button
clean_board_button = document.getElementById("btn-clean");
clean_board_button.addEventListener('click',e=>{
    b.cleanBoard();
    b.updateScreen();
});

//RELOAD button
reloade_board_button = document.getElementById("btn-reloade");
reloade_board_button.addEventListener('click', e=>{
    b.cleanBoard()
    b.initRandomBoard(15);
    b.updateScreen()
});

//SOLVE button
solve_board_button = document.getElementById("btn-solve");
solve_board_button.addEventListener('click',e=>{
    console.log("the board solved ",b.solve());
    b.updateScreen();
});

    

