class ScreenBoard{
    
    #screen_board = [];
    changed_index = [];

    constructor(){

        //initial the matrix screen
        const name_cell = "cell-";
        for (let index = 0; index < 81; index++) {
            let cell = name_cell+(index+1);
            this.#screen_board[index] = document.getElementById(cell);
            
            this.#screen_board[index].addEventListener('change', element=>{
               console.log("change", index, "value:", this.#screen_board[index].value);
               this.changed_index[index] = this.#screen_board[index].value;
            });
            
        }
    }

    writeTo(index, txt){
        this.#screen_board[index].value = txt; 
    }
    
    #readOnly() {
        //makes the place that with number to read only for make sure no one change them.
        this.#screen_board.forEach(element => {
          if (element.value != 0){
          //can change only not original numbers
              element.readOnly = true;
          }else{
              element.readOnly = false;
          }
      });    
    }

    reloadScreen(arr){
        //initial new metrix to screen and makes the number read only.
        for (let index = 0; index < 81; index++) {
            let number = arr[index];
            if(number == 0){
                this.writeTo(index, "");
            }else{
                this.writeTo(index, number);
            }
        }
        
        this.#readOnly();
    }
    cleanChanges(){
        this.changed_index = []; 
    }
};




//-----------------------------SOLVER CLASS--------------------------------------//
class Solver{

    constructor(){
        this.logic_board = []; // the board with the user changes. should check if the board correct.
        this.original_board = []; // the starting board without user changes.

        this.screen_board = new ScreenBoard();
        // this.screen_board.changed_index.addEventListener('change', e=>{
        //     console.log("screen board change", e);
        // })

        //initial the boards to be empty
        this.creatEmptyMatrix(this.logic_board)
        this.creatEmptyMatrix(this.original_board)
    }

    

    // this function check if the number can be
    // in the logic_board matrix in spesific index. 
    isLeagle(index, num, arr = this.logic_board){
        let [i,j] = this.#indexToCordinats(index);

        if(num > 9 || num <1)  return false;
        for (let k = 0; k < 9; k++) {
            if(k != i && arr[this.#cordinatsToIndex(k,j)] == num) return false;
            if(k != j && arr[this.#cordinatsToIndex(i,k)] == num) return false;
            // console.log("i j =", i, j, "index =", index, "true")
        }
        let i2 = (Math.floor(i/3))*3;
        let j2 = Math.floor(j/3)*3;

        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if( (i2+k != i || j2+l != j) && arr[this.#cordinatsToIndex(i2+k, j2+l)] == num) return false;
            }
        }
        return true;
    }

    initRandomBoard2(count = 10){
        // BEFORE USING THIS FUNCTION MAKE SURE THE ARRAY IS EMPTY!!
        // count have to be smaller then 82.
        this.clean();

        let ori_count = count;//for checking how many time its try. //debuging

        while(count > 0){
            let index = Math.floor (Math.random() * (9*9-1));
            
            while(this.logic_board[index] != 0){
                index = Math.floor (Math.random() * (9*9-1));
            }
            // console.log("index of random index", index)
            let number = Math.floor (Math.random()*9);
            
            let trys_counter = 0;
            let is_success = true;
            while ( ! this.isLeagle (index, number)) {
                trys_counter++;
                number = Math.floor (Math.random()*9)+1;
                // console.log("trys counter:",trys_counter, "number:", number);

                if(trys_counter > 5){
                    is_success = false;
                    break;
                }
            }
            if(!is_success) continue;
            this.logic_board[index] = number;
            count--;
            // console.log("random:", ori_count - count)
        }

        //save the correct original board
        this.updateOriginalBoard();

        this.screen_board.reloadScreen(this.logic_board);
    }
//------------------------------------------------------//

    initRandomArray(seed = 15){
        let arr = [];
        this.creatEmptyMatrix(arr);

        while(seed > 0){
            let index;

            do{
                index = Math.floor (Math.random() * (9*9-1));
            } while(arr[index] != 0);
        
            let number = Math.floor (Math.random()*9);
            
            let trys_counter = 0;
            let is_success = true;
            while ( ! this.isLeagle (index, number, arr)) {
                trys_counter++;
                number = Math.floor (Math.random()*9)+1;
                // console.log("trys counter:",trys_counter, "number:", number);

                if(trys_counter > 5){
                    is_success = false;
                    break;
                }
            }
            if(!is_success) continue;
            arr[index] = number;
            seed--;
        }
        return arr;
    }

    initRandomBoard(count = 25, seed = 15){
        let arr = this.initRandomArray(seed);
        
        let arr_solved = this.isSolvable(arr);
        while(!arr_solved){
            arr = this.initRandomArray(seed);
            arr_solved = this.isSolvable(arr);
        }

        let prtision_arr = [];
        this.creatEmptyMatrix(prtision_arr);
        while(count > 0){
            let index;
            do{ 
                index = Math.floor (Math.random() * (9*9-1));
            }while(prtision_arr[index] != 0);
                
            prtision_arr[index] = arr_solved[index];
            count--;
        }

        this.logic_board = prtision_arr;

        this.updateOriginalBoard();
        this.screen_board.reloadScreen(this.logic_board);
       
        console.log("is corrected:", this.isCorrected(arr_solved), arr_solved);
        
    }

    updateOriginalBoard(){
        for (let index = 0; index < 81; index++) {
            this.original_board[index] =  this.logic_board[index];
        }
    }
    

    clean(){
        for (let index = 0; index < 81; index++) {
            this.logic_board[index] = 0;
            this.original_board[index] = 0;
        }
        this.screen_board.reloadScreen(this.original_board);
    }


    //cordinats casting functions
    #cordinatsToIndex(x,y){ return x*9+y; }
    #indexToCordinats(index){
        let x = Math.floor(index / 9);
        let y = index % 9;
        return [x ,y];
    }

    // TODO: can optimize it
    isCorrected(arr = this.logic_board){
        for (let index = 0; index < 81; index++) {
            let number = arr[index];
            if( number != 0 && ! this.isLeagle(index, number, arr)){
                return false;
            }
        }
        return true;
    }
    

    isSolvable(arr){
        if(!this.isCorrected(arr)) return "is not corrected";
        let temp_matrix = [...arr];
        
        if(!this.solverRecursive(0, temp_matrix)){
            return false;
        }
        return temp_matrix;
    }

    solveAndUpdateScreen(){
        this.updateLogicMetrixFromScreen();
        if(!this.isCorrected()) return "is not corrected";
        
        let temp_matrix = [...this.logic_board];

        if(!this.solverRecursive(0, this.logic_board)){
            this.logic_board = [...temp_matrix];
            return false;
        }
        // this.logic_board = [...temp_matrix];
        this.screen_board.reloadScreen(this.logic_board);
        //to upload the view.
        return true;
    }
    
    solverRecursive(index, arr){
        if(index == 81)
            return true;

        // let [i,j] = this.#indexToCordinats(index);
        // console.log("solve recursive",arr[index], "index:",index);

        if(arr[index] != 0){
            return this.solverRecursive(index+1, arr);
        }
        
        for (let k = 1; k < 10; k++) {
            if(this.isLeagle(index,k,arr)){
                // console.log("solve recurs legal - index:",index," value:",k);
                arr[index] = k;
                if(this.solverRecursive(index+1, arr))
                    return true;
            }
        }
        arr[index] = 0;
        return false;
    }

    creatEmptyMatrix(arr){
        for (let index = 0; index < 81; index++) {
            arr[index] = 0;
        }
    }
    
    updateLogicMetrixFromScreen(){        
        this.screen_board.changed_index.forEach ((element, index) => {
            this.logic_board[index] = element;
        });
        this.screen_board.cleanChanges();

        console.log(this.logic_board)
        // console.log(this.original_board)
    }

    cleanChanges(){
        console.log("original:", this.original_board);
        console.log("logical:", this.logic_board);

        this.logic_board = this.original_board;
        this.screen_board.reloadScreen(this.logic_board);
    }
}











// screen = new ScreenBoard();
// screen.writeTo(8, "45");

let solver = new Solver();
solver.initRandomBoard(25);//alot prints here


// console.log("is corrected:", solver.isCorrected());
// console.log("is solved:", solver.solveAndUpdateScreen());
// console.log("is corrected solution", solver.isCorrected())




window.addEventListener('load',()=>{

//_____________________BUTTONS____________________//
//CLEAN button
clean_board_button = document.getElementById("btn-clean");
clean_board_button.addEventListener('click',e=>{
    solver.clean();
});

//RELOAD button
reloade_board_button = document.getElementById("btn-reloade");
reloade_board_button.addEventListener('click', e=>{
    solver.clean()
    solver.initRandomBoard(40);
});

//SOLVE button
solve_board_button = document.getElementById("btn-solve");
solve_board_button.addEventListener('click',e=>{
    console.log("the board solved ",solver.solveAndUpdateScreen());
});

//CLEAN CHANGES
clean_changes_board_button = document.getElementById("btn-clean-changes");
clean_changes_board_button.addEventListener('click',e=>{    
    solver.cleanChanges();
    console.log("clean changes");
})


});


    

