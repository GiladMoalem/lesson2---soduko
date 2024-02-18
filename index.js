// class Events {
    
//     static print(){
//         console.log('events');
//     }
// }

 log = class DebugPrint {

    static LEVELS = {
        "HIGH": 1,
        "NORMAL": 2,
        "LOW": 3
    }
    static level = DebugPrint.LEVELS.NORMAL;
    static time_flag = true;
    
    static #print(level, func_name, message, arr) {
        if (level >= this.level) {
            if (arr) {
                console.log(func_name+"():", message, arr);
            } else {
                console.log(func_name+"():", message);
            }
        }
    }
    
    static high(func_name, message, arr) {
        this.#print(this.LEVELS.HIGH, func_name, message, arr);
    }

    static normal(func_name, message, arr) {
        this.#print(this.LEVELS.NORMAL, func_name, message, arr);
    }
    
    static low(func_name, message, arr) {
        this.#print(this.LEVELS.LOW, func_name, message, arr);
    }

    static runAndPrintTime(func, ...args) {
        const start_time = Date.now();
        console.log(`TIME: start ${func.name} (`, args, ')');
        const res = func(...args);
        const end_time = Date.now();

        const run_time = (end_time - start_time) / 1000
        if (this.time_flag) {
            console.log(`TIME: ${func.name} (`, args, `) take ${run_time} secounds`);   
        }
        return res;
    }
 }

//  log.runAndPrintTime(console.log, "hello", "i", "love");
//  DebugPrint.high("hello gilad" );
//  DebugPrint.level = DebugPrint.LEVELS.HIGH;
//  log.low("hello gilad highh", "main");

//-----------------------------SCREEN_BOARD CLASS--------------------------------------//
class ScreenBoard{
    
    #screen_board = [];
    changed_index = [];
    number_buttons = [];
    selected_cell_index = null;

    constructor(){
        this.init_matrix_screen();

        this.init_number_buttons();
        this.init_key_board();
    }

    init_matrix_screen() {
        const fn = this.init_matrix_screen.name;

        //initial the matrix screen
        const name_cell = "cell-";
        for (let index = 0; index < 81; index++) {
            let cell = name_cell+(index+1);
            this.#screen_board[index] = document.getElementById(cell);

            this.#screen_board[index].addEventListener('click', element=>{
                log.normal(fn, `click ${index}`);
                
                if (this.selected_cell_index !== null) {
                        this.#screen_board[this.selected_cell_index].classList.remove('selected');
                }
                this.#screen_board[index].classList.add('selected');
                this.selected_cell_index = index;
            });
            
        }
    }

    init_number_buttons() {
        const fn = this.init_number_buttons.name;

        this.number_buttons[0] = document.getElementById("btn-0"); // delete cell
        this.number_buttons[1] = document.getElementById("btn-1");
        this.number_buttons[2] = document.getElementById("btn-2");
        this.number_buttons[3] = document.getElementById("btn-3");
        this.number_buttons[4] = document.getElementById("btn-4");
        this.number_buttons[5] = document.getElementById("btn-5");
        this.number_buttons[6] = document.getElementById("btn-6");
        this.number_buttons[7] = document.getElementById("btn-7");
        this.number_buttons[8] = document.getElementById("btn-8");
        this.number_buttons[9] = document.getElementById("btn-9");

        for (let index = 0; index < this.number_buttons.length; index++) {
            const button = this.number_buttons[index];
            
            button.addEventListener('click', ()=>{
                log.normal(fn, `click ${index} button`);
                //TODO: add the functionality.
                // TODO: cant delete readonly number!
                if (this.selected_cell_index === null) return; //not selcted cell
                let char;
                if (index === 0) {
                    char = '';
                } else {
                    char = index;
                }
                this.writeTo(this.selected_cell_index, char);
            });  
        }

    }

    init_key_board() {
        const fn = this.init_key_board.name;
        document.addEventListener('keydown', (event) => {
            if (this.selected_cell_index === null) return;

            const key = event.key;
            log.high(fn, key);

            if (key <= 9 &&  key >= 1) {
                this.writeTo(this.selected_cell_index, key);
            }
            if (["Backspace", "Delete"].includes(key)) {
                this.writeTo(this.selected_cell_index, '');
            }
        });
    }

    writeTo(index, txt){
        this.#screen_board[index].innerText = txt;
        this.changed_index[this.selected_cell_index] = txt;
    }
    
    // #readOnly() {
    //     //makes the place that with number to read only for make sure no one change them.
    //     this.#screen_board.forEach(element => {
    //       if (element.value != 0){
    //       //can change only not original numbers
    //           element.readOnly = true;
    //           log.normal(element, 'readonly');
    //       }else{
    //           element.readOnly = false;
    //       }
    //   });
    // }

    init_screen_numbers(arr) {
        for (let index = 0; index < 81; index++) {
            let number = arr[index];
            if(number == 0){
                this.writeTo(index, "");
                this.#screen_board[index].classList.remove('read_only');
            }else{
                this.writeTo(index, number);
                this.#screen_board[index].classList.add('read_only');
            }
        }
    }

    reloadScreen(arr){
        //initial new metrix to screen.
        for (let index = 0; index < 81; index++) {
            let number = arr[index];
            if(number == 0){
                this.writeTo(index, "");
            }else{
                this.writeTo(index, number);
            }
        }
    }

    cleanChanges(){
        this.changed_index = []; 
    }
};




//-----------------------------SOLVER CLASS--------------------------------------//
class Solver{
    static board_size = 81;
    #start_time;

    constructor(){
        this.logic_board = []; // the board with the user changes. should check if the board correct.
        this.original_board = []; // the starting board without user changes.

        this.screen_board = new ScreenBoard();

        //initial the boards to be empty
        this.creatEmptyMatrix(this.logic_board);
        this.creatEmptyMatrix(this.original_board);

        this.restartTime();
    }

    restartTime() {
        const fn = "restartTime";

        this.#start_time = Date.now();
        log.normal(fn, `restart time ${this.#start_time}`);
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
        const fn = this.initRandomArray.name;

        let arr = [];
        this.creatEmptyMatrix(arr);

        while(seed > 0){
            let index;

            do{
                index = Math.floor (Math.random() * (9*9));
                log.high(fn, `random index:${index}`);
            } while(arr[index] != 0);
        
            let number = Math.floor (Math.random()*(9+1));
            log.high(fn, `random number ${number}`);
            
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
        log.normal(fn, "array is founded", arr);
        return arr;
    }

    // TODO: use it with square but not line.
    getNextPermutation(arr) {
        let index = arr.length -1;
        const min_value = 0;
        const max_value = Solver.board_size -1;
        
        // find the index
        while (arr[index] >= max_value || max_value - arr[index] < arr.length - index) {
            index--;
        }
        if (index < 0) return null;
        
        arr[index]++;
        for (let j = 1; j + index< arr.length; j++) {
            arr[index+j] = arr[index+j-1]+1;
        }

        return arr;
    }

    getIndexes(num_of_indexes) {
        const fn = this.getIndexes.name;
        let arr = [];

        while(num_of_indexes > 0){
            let index;
            do { 
                index = Math.floor (Math.random() * (Solver.board_size)/2);
            } while(arr.includes(index));
                
            arr.push(index);
            // arr.push(solver.board_size -1 - index);

            num_of_indexes--;
            num_of_indexes--;
        }
        arr.forEach(index => {
            arr.push(Solver.board_size -1 - index);
        });

        log.high(fn, arr);
        return arr;
    }
    
    createUnsolvedUniqueBoard(solved_board, num_of_filled_cells=25) {
        const fn = this.createUnsolvedUniqueBoard.name;

        // create unsolved board with <count> full cells and unique solution. 
        let prtision_arr = [];
        let is_unique = false;


        let chosen_indexs = [3,4,12,6,7,15,9,18,19,
        36,45,46,40,34,35,44,
        65,73,74,68,76,77,61,62,72];
        let chosen_indexs2 = [9,10,20,4,13,21,7,16,24,
        36,37,47,33,43,44,
        56,64,73,59,67,76,60,70,71,40];

        
        // for (let index = 0; index < num_of_filled_cells; index++) {
        //     chosen_indexs[index] = index;
        // } 

        while (!is_unique && chosen_indexs != null) {
            this.creatEmptyMatrix(prtision_arr);

            //local check
            if (chosen_indexs2 && chosen_indexs[0] !== 3) {
                chosen_indexs = chosen_indexs2;
                chosen_indexs2 = null;
            } 
            // copy the value of the chosen indexs
            chosen_indexs.forEach(chosen_index =>{
                prtision_arr[chosen_index] = solved_board[chosen_index];
            });

            // check if the board is unique
            const all_the_board_from_partion_arr = this.solverRecursiveDev(0, prtision_arr);
            if (all_the_board_from_partion_arr.length === 1) {
                log.normal(fn, 'find 1 unique board');
                log.high(fn, "chosen_indexs", chosen_indexs.sort(function(a, b){return a - b}));
                log.high(fn, 'prtision_arr', prtision_arr);
                is_unique = true;
            } else {
                log.high(fn, `not unique board, find ${all_the_board_from_partion_arr.length} solutions for indexs: `, chosen_indexs);
                // this.getNextPermutation(chosen_indexs);
                chosen_indexs = this.getIndexes(num_of_filled_cells);
            }
        }

        // ---- try to minimaz the amount of chosen indexs ---- //
        let deleted_counter = 0;
        chosen_indexs.forEach(chosen_index => {
            const value = prtision_arr[chosen_index];
            prtision_arr[chosen_index] = 0;
            if (this.solverRecursiveDev(0, [...prtision_arr]).length === 1){
                deleted_counter++;
                log.high(fn, `OPTIMAZE! deleting index:${chosen_index}, value:${value}`);
            } else {
                prtision_arr[chosen_index] = value;
            }
        });
        log.normal(fn, `deleted ${deleted_counter} cells from ${chosen_indexs.length} cells`);

        // debug message
        let count =0;
        prtision_arr.forEach(element => {
            if (element !== 0) 
                count ++;
        });
        log.normal(fn, `this board have ${count} cells`);

        return prtision_arr;
    }

    initRandomBoard(count = 25, seed = 15){
        const fn = this.initRandomBoard.name;

        //TODO: change the timer to log.time
        const startTime = Date.now();
        // create full solved board.
        let arr_solved;
        let full_solve_counter = 0;
        do {
            let arr = log.runAndPrintTime(this.initRandomArray.bind(this), seed);
            arr_solved = log.runAndPrintTime(this.isSolvable.bind(this), arr);
            full_solve_counter++;
        }
        while(!arr_solved);
        log.normal(fn, `solvable board founded after ${full_solve_counter} times, takes ${(Date.now()-startTime) / 1000} sec`);
        log.low(fn, 'solveable board:', arr_solved)
        // create unsolved board with <count> full cells and unique solution. 
        // let prtision_arr = [];
        // let is_unique = false;
        // while (!is_unique) {
        //     let cell_count = count;
        //     this.creatEmptyMatrix(prtision_arr);
        //     while(cell_count > 0){
        //         let index;
        //         do{ 
        //             index = Math.floor (Math.random() * (9*9-1));
        //         }while(prtision_arr[index] != 0);
                    
        //         prtision_arr[index] = arr_solved[index];
        //         cell_count--;
        //     }

        //     // check if the board is unique
        //     const all_the_board_from_partion_arr = this.solverRecursiveDev(0, prtision_arr);
        //     if (all_the_board_from_partion_arr.length === 1) {
        //         console.log('find 1 unique board');
        //         is_unique = true;
        //     } else {
        //         console.log(`not unique board, find ${all_the_board_from_partion_arr.length} solutions`);
        //     }
        // }

        // create unique unsolved board.
        const prtision_arr = log.runAndPrintTime(this.createUnsolvedUniqueBoard.bind(this), arr_solved, count);

        this.logic_board = prtision_arr;

        this.updateOriginalBoard();
        this.screen_board.init_screen_numbers(this.logic_board);
       
        log.high(fn, `is corrected: ${this.isCorrected(arr_solved)}`, arr_solved);
        
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
        const fn = this.isSolvable.name;

        if(!this.isCorrected(arr)) {
            log.low(fn, 'is not corrected array:', arr);
            return "is not corrected";  
        } 
        let temp_matrix = [...arr];
        
        if(!log.runAndPrintTime(this.solverRecursive.bind(this), 0, temp_matrix)){
            return false;
        }
        return temp_matrix;
    }

    solveAndUpdateScreen(){
        const fn = "solveAndUpdateScreen";

        this.updateLogicMetrixFromScreen();
        if(!this.isCorrected()) {
            log.low(fn, 'the screen board is not corrected', this.logic_board)
            return "is not corrected";
        }
        let temp_matrix = [...this.logic_board];

        if(!this.solverRecursive(0, this.logic_board)){
            this.logic_board = [...temp_matrix];
            return false;
        }
        
        //update the view.
        this.screen_board.reloadScreen(this.logic_board);
        return true;
    }

    solverRecursiveDev(index, curr_arr) {
        // the end
        if (index === 81) {
            // console.log('solverRecursiveDev find', curr_arr);
            return [[...curr_arr]];
        }
        
        // the cell is full
        if (curr_arr[index] != 0) {
            return this.solverRecursiveDev(index+1, curr_arr);
        }

        let all_posiable_arrays = [];
        for (let number = 1; number <= 9; number++) {
            if (this.isLeagle(index, number, curr_arr)){
                curr_arr[index] = number;
                let child_solutions = this.solverRecursiveDev(index+1, curr_arr);
                // if (child_solutions.length !== 0) {
                    all_posiable_arrays = all_posiable_arrays.concat(child_solutions);
                // }
                if (all_posiable_arrays.length > 1) return all_posiable_arrays;
            }
        }

        curr_arr[index] = 0;
        return all_posiable_arrays;
    }
    
    solverRecursive(index, arr){
        // console.log("solve recursive", arr, "index:",index);
        if(index == 81)
            return true;

        // let [i,j] = this.#indexToCordinats(index);

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
        for (let index = 0; index < Solver.board_size; index++) {
            arr[index] = 0;
        }
    }
    
    updateLogicMetrixFromScreen(){
        const fn = "updateLogicMetrixFromScreen";

        this.screen_board.changed_index.forEach ((element, index) => {
            this.logic_board[index] = element;
        });
        this.screen_board.cleanChanges();

        log.high(fn, "the logic board:", this.logic_board);
        log.high(fn, "the original board:", this.original_board);
    }

    cleanChanges(){
        const fn = "cleanChanges";

        log.normal(fn, "original board:", this.original_board);;
        log.normal(fn, "logical board:", this.logic_board);

        this.logic_board = [...this.original_board];
        this.screen_board.reloadScreen(this.logic_board);
    }

    getStartTime(){return this.#start_time;}

}


const solver = new Solver();
const num_of_filled_cells = 30;
log.runAndPrintTime(solver.initRandomBoard.bind(solver), num_of_filled_cells);


window.addEventListener('load',()=>{

//_____________________BUTTONS____________________//

//CLEAN button
const clean_board_button = document.getElementById("btn-clean");
clean_board_button.addEventListener('click',e=>{
    const fn = "clean_board_button.addEventListener";

    log.normal(fn, "click clean button");
    solver.clean();
});

//RELOAD button
const reloade_board_button = document.getElementById("btn-reloade");
reloade_board_button.addEventListener('click', e=>{
    const fn = "reloade_board_button.addEventListener";

    log.normal(fn, "click reload button");
    solver.clean()
    solver.initRandomBoard(num_of_filled_cells);
    solver.restartTime();
});

//SOLVE button
const solve_board_button = document.getElementById("btn-solve");
solve_board_button.addEventListener('click',e=>{
    const fn = "solve_board_button.addEventListener";
    log.normal(fn, "click solve button");
    log.normal(fn, `the board solved ${solver.solveAndUpdateScreen()}`);
});

//CLEAN CHANGES
const clean_changes_board_button = document.getElementById("btn-clean-changes");
clean_changes_board_button.addEventListener('click',e=>{
    const fn = "clean_changes_board_button.addEventListener";

    log.normal(fn, "click clean changes button");
    solver.cleanChanges();
})


});




const time = document.getElementById("time");
start = Date.now();
time.innerText = "TIME: 00:00";

var t=setInterval(runFunction,1000);
function runFunction(){
    now = Date.now();
    start = solver.getStartTime();

    seconds_passed = Math.floor((now - start) / 1000) % 60;
    minutes_passed = Math.floor((now - start) / (1000 * 60)) % 60;
    hours_passed = Math.floor((now - start) / (1000 * 60 * 60)) % 24;
    
    if(seconds_passed < 10) seconds_passed = '0'+ seconds_passed;
    if(minutes_passed < 10) minutes_passed = '0'+ minutes_passed;
    if(hours_passed < 10) hours_passed = '0' + hours_passed;
    // console.log(seconds_passed)

    if(hours_passed != 0){
        time.innerText = `TIME:  ${hours_passed}:${minutes_passed}:${seconds_passed}`;
    }
    else{
        time.innerText = `TIME:  ${minutes_passed}:${seconds_passed}`;
    }
    
}
    // clearInterval(t);




