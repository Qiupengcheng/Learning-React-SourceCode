Array.prototype.map2 = function(fn){
    var len = this.length;

    if(len === 0){
        return [];
    }

    var resultArr = [];
    for(var i=0; i<len; i++){
        resultArr.push(fn(this[i], i, this));
    }

    return resultArr;
}

var m = [1,2,3,4]
console.log(m.map2((item) => item*2))