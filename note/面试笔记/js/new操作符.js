function Person({name, age}){
    this.name = name;
    this.age = age;
}

var p1 = new Person({name: 'qiu', age: 18})

function myNew(Obj, ...args){
    var newObj = Object.create(null) // 创建一个空对象
    newObj.__proto__ = Obj.prototype // 将空对象的隐式原型（__proto__）指向构造函数的原型对象
    Obj.apply(newObj, args) // 执行构造函数
    return newObj
}

var p2 = myNew(Person, {
    name: 'xiabao',
    age: 17
})

console.log('..');



function _new(func){
    var o = Object.create(func.prototype)  // 先创建一个新对象实例，该实例的__proto__属性指向构造函数的原型对象
    var k = func.apply(o, arguments.slice(1)) // 执行构造函数，this指针指向新创建的对象实例
    // 如果构造函数执行后的结果 return 回一个对象，则直接返回结果, 否则将一开始创建的对象实例返回
    if(typeof k === 'object'){
        return k
    }else{
        return o
    }
}