Function.prototype.myBind = function(self, ...bindedArgs){
    var callFun = this;
    return function(...args){
        callFun.apply(self, bindedArgs.concat(args));
    }
}

var obj = {
    name: 'qiu',
    say: function(...args){
        console.log(this.name)
        console.log(args)
    }
}

var xia = {
    name: 'xiabao'
}

var bundSay = obj.say.myBind(xia, 1,2,3)
bundSay(4,5,6)