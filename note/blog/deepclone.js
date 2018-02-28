const obj = {
  arr: [1,2,3],
  user: {
    name: 'qiu',
    age: 18
  }
}

function deepClone(target){
  var baseDataStructure = {
    'number': true,
    'string': true,
    'boolean': true,
    'undefined': true
  };
  var tarType = typeof target,
      newObj;

  // 如果为基本数据类型，则直接复值
  if(baseDataStructure[tarType] || target === null){
    return target
  }else if(tarType==='object' && target instanceof Array){
    newObj = target.map(function(item){
      return deepClone(item)
    })
    newObj.constructor.prototype = Object.getPrototypeOf(target)
    for(var key in target){
      if(target.hasOwnProperty(key)){
        newObj[key] = deepClone(target[key])
      }
    }
    return newObj;
  }else{
    newObj = {};
    for(var key in target){
      if(target.hasOwnProperty(key)){
        newObj[key] = deepClone(target[key])
      }
    }
    return newObj;
  }
}

var newObj = deepClone(obj);
newObj.arr.push(121212)
newObj.user.sexual = 'male'

console.log(newObj)