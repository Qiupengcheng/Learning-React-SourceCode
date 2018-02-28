var Queue = require('./queue');

class PriorityQueue extends Queue {
    constructor(validate){
        super(validate)
        this.QueueItem = function(item, priority){
            this.item = item;
            this.priority = priority;
        }
    }

    enqueue(item, priority){
        if(!this.validate(item)) return false;

        const newItem = new this.QueueItem(item, priority),
              values = this._values,
              len = values.length;
        let added = false;

        if(len === 0){
            values.push(newItem);
            return true;
        }else{
            for(let i=0; i<len; i++){
                if(values[i].priority < priority){
                    values.splice(i, 0, newItem)
                    added = true;
                    break;
                }
            }
        }

        if(!added) values.push(newItem);
    }
}

var q2 = new PriorityQueue();
console.log(q2)
q2.enqueue(21, 4)
q2.enqueue(432, 3)
q2.enqueue(321, 1)
q2.enqueue(542, 0)
q2.enqueue(431, 10)
q2.enqueue(342, 1)
q2.dequeue()
q2.showAll()
q2.clear()
q2.showAll()
