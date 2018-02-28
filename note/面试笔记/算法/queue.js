class Queue {
    constructor(validate){
        this._values = [];
        if(typeof validate === 'function'){
            this.validate = validate;
        }else{
            this.validate = this._validate;
        }
    }

    // 不限制输入
    _validate(value){
        return true
    }

    dequeue(){
        return this._values.shift()
    }

    enqueue(item){
        if(!this.validate(item)){
            return false
        }

        this._values.push(item)
        return this._values
    }

    // for debug
    showAll(){
        console.log(this._values)
    }

    front(){
        return this._values[0]
    }

    clear(){
        this._values = [];
    }

    isEmpty(){
        return this._values.length === 0
    }

    get size(){
        return this._values.length
    }
}

var q1 = new Queue();
q1.isEmpty();
q1.enqueue(1);
q1.enqueue(2);
q1.size;
q1.isEmpty();
q1.dequeue();
q1.front();
q1.clear();

module.exports = Queue;