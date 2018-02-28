class LinkedListElement {
    constructor(element){
        this.element = element;
        this.next = null;
    }
}

class LinkedList {
    constructor(){
        this.start = null;
        this.length = 0;
    }

    append(element){
        var newElement = new LinkedListElement(element);

        if(!this.start){
            this.start = newElement;
        }else{
            let current = this.start;
            while(current.next){
                current = current.next
            }
            current.next = newElement;
        }
        this.length++
    }

    remove(element){
        if(!this.start){
            return false
        }

        if(this.start.element === element){
            this.start = this.start.next
            this.length--
            return true
        }

        let current = this.start,
            prev = null;

        do{
            if(current.element === element){
                prev.next = current.next;
                this.length--
            }else{
                prev = current;
            }
            current = current.next;
        }while(current)
    }

    indexOf(element){
        var current = this.start,
            index = 0,
            finded = false;
        
        while(current && !finded){
            if(current.element === element){
                finded = true
            }else{
                current = current.next
                index++
            }
        }

        return finded?index:-1;
    }

    insert(position, element){
        var current = this.start,
            prev = null,
            _p = position;

        var newElement = new LinkedListElement(element);
        
        if(position === 0){
            newElement.next = current;
            this.start = newElement;
            return true
        }

        while(current && _p){
            prev = current;
            current = current.next;
            _p--;
        }

        if(_p === 0){
            newElement.next = current;
            prev.next = newElement;
            return true
        }else{
            return false
        }
    }
}

var l1 = new LinkedList();
l1.append(100);
l1.append(400);
l1.append('abc');
var a = l1.indexOf(100);
var b = l1.indexOf(400);
l1.remove(100);
var c = l1.indexOf(100)
l1.insert(1, 10)
console.log('end')
console.log('end 2')