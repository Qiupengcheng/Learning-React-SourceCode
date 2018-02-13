## 概述
[上一篇](https://www.jianshu.com/p/70e91fbed93a)讲到```React```中的元素（```ReactElement```的“实例”）会有一个```type```属性，而该值将决定其被渲染时的处理结果。
本篇，我们就通过```ReactDOM.render```的源码来了解一下其处理过程。

## ReactDOM.render方法使用
首先看```ReactDOM.render```的使用方式：
```javascript
const App = (<h2>Hello World!</h2>)
ReactDOM.render(App, document.querySelector('#app'))
```
或者
```javascript
class App extends React.Component {
  render(){
    return (
      <div>
        <h2>Hello World!</h2>
      </div>
    )
  }
}
ReactDOM.render(<App />, document.querySelector('#app'))
```
根据我们[上一篇](https://www.jianshu.com/p/70e91fbed93a)的讨论，我们知道上面两个例子中```ReactDOM.render```第一个参数传入的都是```ReactElement```的“实例”。

而当第一个参数传入一个字符串类型，如下：
```javascript
ReactDOM.render('This is String', document.querySelector('#app'))

// Uncaught Error: ReactDOM.render(): Invalid component element. Instead of passing a string like 'div', pass React.createElement('div') or <div />.
```
可见，ReactDOM.render第一个参数不支持字符串类型，即不会直接创建 TextNode 插入到第二个参数指定的容器中。

接下来，我们一起进入到源码中查看该方法。

## 源码结构
查看```ReactDOM.js```文件，可以看到```ReactDOM.render```引用```ReactMount.js```的```render```方法,如下：

```javascript
ReactMount = {
  // ReactDOM.render直接引用此方法
  render: function (nextElement, container, callback) {
    return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
  },
  // 实际执行render的方法
  _renderSubtreeIntoContainer: function (parentComponent, nextElement, container, callback) {
    ReactUpdateQueue.validateCallback(callback, 'ReactDOM.render');

    var nextWrappedElement = React.createElement(TopLevelWrapper, {
      child: nextElement
    });

    // parentComponent为null
    var nextContext;
    if (parentComponent) {
      var parentInst = ReactInstanceMap.get(parentComponent);
      nextContext = parentInst._processChildContext(parentInst._context);
    } else {
      nextContext = emptyObject;
    }


    var prevComponent = getTopLevelWrapperInContainer(container);

    if (prevComponent) {
      var prevWrappedElement = prevComponent._currentElement;
      var prevElement = prevWrappedElement.props.child;

      // 判断上一次的prevElement和nextElement是否是同一个组件，或者仅仅是数字、字符串，如果是，则直接update，
      // 否则，重新渲染整个Element
      if (shouldUpdateReactComponent(prevElement, nextElement)) {
        var publicInst = prevComponent._renderedComponent.getPublicInstance();
        var updatedCallback = callback && function () {
          callback.call(publicInst);
        };
        // 更新vdom
        ReactMount._updateRootComponent(prevComponent, nextWrappedElement, nextContext, container, updatedCallback);
        return publicInst;
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var reactRootElement = getReactRootElementInContainer(container);
    var containerHasReactMarkup = reactRootElement && !!internalGetID(reactRootElement);
    var containerHasNonRootReactChild = hasNonRootReactChild(container);


    var shouldReuseMarkup = containerHasReactMarkup && !prevComponent && !containerHasNonRootReactChild;
    var component = ReactMount._renderNewRootComponent(nextWrappedElement, container, shouldReuseMarkup, nextContext)._renderedComponent.getPublicInstance();
    if (callback) {
      callback.call(component);
    }
    return component;
  },
}
```