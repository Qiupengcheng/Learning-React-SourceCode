// 定义Tree类
function BinarySearchTree(){
    var Node = function(key){
        this.key = key;
        this.left = null;
        this.right = null;
    }

    var root = null;

    var insertNode = function(target, newNode){
        if(target.key < newNode.key){
            if(target.right !== null){
                insertNode(target.right, newNode)
            }else{
                target.right = newNode
            }
        }else if(target.key > newNode.key){
            if(target.left !== null){
                insertNode(target.left, newNode)
            }else{
                target.left = newNode
            }
        }
    }

    this.insert = function(key){
        var newNode = new Node(key)
        if(root===null){
            root = newNode
        }else{
            insertNode(root, newNode)
        }
    }

    this.getRoot = function(){
        return root
    }

    function searchNode(target, key){
        if(target === null) return false;

        if(target.key === key){
            return target
        }else if(target.key < key){
            return searchNode(target.right, key)
        }else{
            return searchNode(target.left, key)
        }
    }

    this.search = function(key){
        if(root === null){
            return false
        }else{
            return searchNode(root, key)
        }
    }

    /**
     * 先序遍历、中序遍历、后序遍历，只需要改变cb的位置即可
     * 先序遍历，如果只是想遍历结果并处理，直接使用先序遍历
     * 中序遍历，可以按从小到大排序遍历出树（按顺序）
     * 后序遍历，先处理子节点，再处理父节点，适用于需要进行破坏性操作的情况
     */
    function preTraverse(node, cb){
        if(node === null) return;

        cb(node.key)
        preTraverse(node.left, cb)
        preTraverse(node.right, cb)
    }   

    this.preOrderTraverse = function(cb){
        if(typeof cb !== 'function'){
            cb = console.log
        }

        if(root === null){
            return
        }else{
            preTraverse(root, cb)
        }
    }

    var execStack = [];
    this.preOrderTraverseStack = function(cb){
        if(typeof cb !== 'function'){
            cb = console.log
        }
        var current = root
        if(current === null){
            return 
        }else{
            execStack.push(current)
            while(execStack.length>0){
                current = execStack.pop()
                cb(current.key);
                if(current.right) execStack.push(current.right);
                if(current.left) execStack.push(current.left);
            }
        }
    }    

    function findMin(node){
        var current = node
        while(current.left !== null){
            current = current.left
        }
        return current.key
    }    

    this.removeNode = function(key){
        var node = this.search(key);
        if(!node) return true;

        // 判断是否为叶节点，是则直接移除
        if(node.left === null && node.right === null){
            node = null
        }else if(node.left === null){
            node = node.right
        }else if(node.right === null){
            node = node.left
        }else{
            var minNode = findMin(node)
            minNode.left = node.left
            minNode.right = node.right
            node = minNode
            this.removeNode(node.right, key)
        }
        return node
    }

}

var bt = new BinarySearchTree();
bt.insert(10);
bt.insert(6);
bt.insert(3)
bt.insert(9)
bt.insert(15)
bt.insert(20)
var rt = bt.getRoot();
var has10 = bt.search(10);
var has20 = bt.search(20)
var has14 = bt.search(14)
bt.preOrderTraverse()
console.log('.....');
bt.preOrderTraverseStack()
console.log(bt)