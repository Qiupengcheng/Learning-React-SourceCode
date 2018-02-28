class DoublyLinkedListElement {
    constructor(element){
        this.next = null;
        this.prev = null;
        this.element = element;
    }
}

class DoublyLinkedList{
    constructor(){
        this.head = null;
        this.end = null;
        this.length = 0;
    }

    append(element){
        const newElement = new DoublyLinkedListElement(element);
        if(this.length === 0){
            this.head = this.end = newElement;
        }else{
            newElement.prev = this.end;
            this.end.next = newElement;
            this.end = newElement;
        }
        this.length++;
    }

    remove(element){
        // if(this.)
    }
}

var dl = new DoublyLinkedList();
dl.append(10);
dl.append(20);
dl.append(1010);

