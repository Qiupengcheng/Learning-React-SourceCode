判断对象是否数组
```javascript
var arr = [1,2,3];

// 1
Array.isArray(arr);

// 2
arr.constructor === Array;

// 3
arr.__proto__ === Array.prototype;

// 4
arr instanceof Array;

// 5
Object.prototype.toString.call(arr); // [object, Array]
```