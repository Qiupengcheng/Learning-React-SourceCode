## 概述
本系列文章将通过React、ReactDOM的几个关键方法，如 ```ReactDOM.render```、 ```this.setState```开始，对React源码进行解读。

与一般源码解析的文章不同，本系列文章不会在文中一步步通读代码，而是通过对关键方法的探究，一步步了解React内部的原理。

阅读前，您应具备React、JSX、ES6的实践经验，同时应了解babel、chrome断点调试等。

**本文所阅读的React源码版本为 v15.6.2，[可点击此下载。](https://github.com/facebook/react/tree/v15.6.2)**

## 从React.createElement及JSX讲起
众所周知，JSX只是为```React.createElement(component, props, ...children)```方法提供的语法糖，如以下代码([参考文档](https://doc.react-china.org/docs/jsx-in-depth.html))：
```javascript
// JSX语法
let app = (<div id='app'>Hello World!</div>);
```
在babel编译后：
```javascript
// babel编译后：
let app = React.createElement('div', {id: 'app'}, 'Hello World!');
```
将 ```app``` 在```console.log```出来后，得到以下的结果：
![element.png](http://upload-images.jianshu.io/upload_images/3913372-79433f4ec9c719f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接下来，我们到源码中```ReactElement.js```查看 ```React.createElement``` 方法，如下：
```javascript
ReactElement.createElement = function (type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    // 对config参数的处理，您可直接查看源码，此处隐藏
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    // 处理 children多于1个时...
  }

  // 写入元素的defaultProps
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
};
```

可以看到其调用了名为 ```ReactElement``` 的工厂方法， 该工厂方法主要代码如下：
```javascript
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // 增加一个属性，用来标识这个对象是一个 ReactElement '对象'
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  if (process.env.NODE_ENV !== 'production') {
      // 开发环境中的提示... 
  }

  return element;
};
```

至此，我们在JSX中所写的元素，都是使用```React.createElement```创建```ReactElement```实例。

## 所谓“组件” Component
在Reactv16之前，有三种自定义组件的方式：
```javascript
// v16.0.0以后已经废弃此方法
var Hello = React.createClass({
    render(){
        return <p>Hello world, {this.props.guest}!</p>
    }
})
```
```javascript
// 无状态组件推荐
var Bye = function(props){
    return (
        <p>Bye Bye, {props.guest}!</p>
    )
}
```
```javascript
// ES6类继承
class SayHi extends React.Component {
    render(){
        return <p>Hi, {this.props.guest}!</p>
    }
}
```
我们从ES6类继承的方式来着手，查看 ```React.js``` 文件，可以找到 ```React.Component``` 实际为 ```ReactBaseClasses.js``` 中定义的 ```ReactComponent```构造函数（类）
```javascript
function ReactComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

ReactComponent.prototype.isReactComponent = {};

ReactComponent.prototype.setState = function (partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};

ReactComponent.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'forceUpdate');
  }
};
```
此处可以看到我们熟悉的props、context都是在实例化这个构造函数时传入的。
```setState```及```forceUpdate```都是原型上的方法，参数中传入的 ```updater``` 将在我们分析 ```ReactDOM.render``` 这个方法的时候详细分析。

我们知道，其实```class```本质上就是原型继承的语法糖，使用```class```定义的 组件 类，实际也是一个 ```'function'```， 与无状态组件定义的时候是一样的。
那么，组件与上一节所讲的```ReactElement```有什么联系呢？

我们通过以下代码来分析：
```javascript
class Hello extends React.Component {
  render(){
    return (
      <div>
        <h2>{this.props.title}</h2>
      </div>
    )
  }
}

console.log(<Hello />) // <Hello /> 相当于 React.createElement(Hello)
```
查看以下结果：
![component.png](http://upload-images.jianshu.io/upload_images/3913372-7c38ae9247fdd615.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

对比上一次的结果，我们发现只有type这里是存在差异的，**而这种差异带来的，就是React在渲染元素、组件时候的差异了**，这个将放在下一篇，也许是下下篇讲。

## 关于组件容易混淆的概念
```javascript
// No.1
class Hello extends React.Component {
  render(){
    return (
      <h2>Hello world!</h2>
    )
  }
}

// No.2
var HelloCom = <Hello />

// No.3
var HelloEle = (
  <div>
    <h2>Hello world!</h2>
  </div>
)
```
以上代码中的 ```Hello、HelloCom、HelloEle```哪些是“组件” ？

答案： 只有 ```Hello``` 一个。

首先看 组件的定义： [参考文档](http://www.css88.com/react/docs/components-and-props.html)

在这里，``` HelloCom 、 HelloEle ```实际上已经是ReactElement的一个“**实例**”（说实例不太恰当，但足够形象）了，而非如组件定义的：是一个可复用的部件，接收props，并返回元素。

## 总结
本篇了解了React中```ReactElement```和```ReactComponent```部分的源码，并从中了解到我们在JSX中所写的dom在Javascript中会被转换成一个对象。
读到这里，您可能会想，那这些对象是怎么被转换并插入到我们的dom结构中呢？敬请期待下一篇关于```ReactDOM.render```的分析。