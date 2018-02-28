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