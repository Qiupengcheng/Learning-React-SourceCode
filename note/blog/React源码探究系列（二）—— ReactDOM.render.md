## 概述
[上一篇](https://www.jianshu.com/p/70e91fbed93a)讲到```React```中的元素（```ReactElement```的“实例”）会有一个```type```属性，而该值将决定其被渲染时的处理结果。
```ReactDOM.render```实际即为React初次将vdom渲染至真实dom树的过程，其中包括了创建元素、添加属性、绑定事件等等操作。
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

    // 将传入的element用TopLevelWrapper包装，
    // 包装后的元素，标记有rootID，并且拥有render方法，
    // 具体可看TopLevelWrapper的源码
    var nextWrappedElement = React.createElement(TopLevelWrapper, {
      child: nextElement
    });

    // ReactDOM.render方法调用时，parentComponent为null
    var nextContext;
    if (parentComponent) {
      var parentInst = ReactInstanceMap.get(parentComponent);
      nextContext = parentInst._processChildContext(parentInst._context);
    } else {
      nextContext = emptyObject;
    }

    // 第一次执行时，prevComponent为null，具体可看此方法源码
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
    // 本次为首次渲染，因此调用ReactMount._renderNewRootComponent
    var component = ReactMount._renderNewRootComponent(nextWrappedElement, container, shouldReuseMarkup, nextContext)._renderedComponent.getPublicInstance();
    if (callback) {
      callback.call(component);
    }
    return component;
  },
  /**
   * Render a new component into the DOM. Hooked by hooks!
   *
   * @param {ReactElement} nextElement element to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
  _renderNewRootComponent: function (nextElement, container, shouldReuseMarkup, context) {

    ReactBrowserEventEmitter.ensureScrollValueMonitoring();
    // 初始化组件实例，并生成真实dom元素
    var componentInstance = instantiateReactComponent(nextElement, false);

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.

    ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, container, shouldReuseMarkup, context);

    var wrapperID = componentInstance._instance.rootID;
    instancesByReactRootID[wrapperID] = componentInstance;

    return componentInstance;
  },
}
```

从以上代码可以看出，当调用```ReactDOM.render```时，使用```TopLevelWrapper```对element进行包装，随后将其传入```ReactMount._renderNewRootComponent```中，在此方法内，调用```instantiateReactComponent```生成真实dom实例。

接下来学习```instantiateReactComponent```的源码，源码位置位于```instantiateReactComponent.js```文件。

```javascript
/**
 * Given a ReactNode, create an instance that will actually be mounted.
 *
 * @param {ReactNode} node
 * @param {boolean} shouldHaveDebugID
 * @return {object} A new instance of the element's constructor.
 * @protected
 */
function instantiateReactComponent(node, shouldHaveDebugID) {
  var instance;

  if (node === null || node === false) {
    instance = ReactEmptyComponent.create(instantiateReactComponent);
  } else if (typeof node === 'object') {
    var element = node;
    var type = element.type;

    // 代码块(1)
    // Special case string values
    if (typeof element.type === 'string') {
      // type为string的，调用createInternalComponent方法，
      // 对节点进行处理，包含属性、默认事件等等
      instance = ReactHostComponent.createInternalComponent(element); // (2)
    } else if (isInternalComponentType(element.type)) {
      // 内置type？
      // This is temporarily available for custom components that are not string
      // representations. I.e. ART. Once those are updated to use the string
      // representation, we can drop this code path.
      instance = new element.type(element);

      // We renamed this. Allow the old name for compat. :(
      if (!instance.getHostNode) {
        instance.getHostNode = instance.getNativeNode;
      }
    } else {
      // 其余的均为自定义组件, 通过此方法，创建组件实例
      // 此方法比较复杂
      instance = new ReactCompositeComponentWrapper(element);
    }
  } else if (typeof node === 'string' || typeof node === 'number') {
    // 字符串或数字，直接调用 createInstanceForText，生成实例
    instance = ReactHostComponent.createInstanceForText(node);
  } else {
    !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Encountered invalid React node of type %s', typeof node) : _prodInvariant('131', typeof node) : void 0;
  }

  // These two fields are used by the DOM and ART diffing algorithms
  // respectively. Instead of using expandos on components, we should be
  // storing the state needed by the diffing algorithms elsewhere.
  // 与diff算法相关，TOREAD...
  instance._mountIndex = 0;
  instance._mountImage = null;

  return instance;
}
```

结合注释细读以上代码，如代码块（1）中，根据```node```的```type```类型来渲染节点，也即本文一开始所提到的```type```。为更好理解，我们使用以下代码渲染一个input元素：
```javascript
/**
 * 以下JSX相当于：
 * const inputEle = React.createElement('input', {
 *  defaultValue: '10',
 *  onClick: () => console.log('clicked')
 * })
*/
const inputEle = (
  <input
    defaultValue="10"
    onClick={() => console.log('clicked')}
  />
)

ReactDOM.render(inputEle, document.getElementById('app'))
```

根据我们上一篇所讲，```inputEle```为```ReactElement```的一个实例，其```type```属性为```input```。
因此，在```instantiateReactComponent```方法中，应该执行（2）处的分支，即：```ReactHostComponent.createInternalComponent(element)```。
我们查看```ReactHostComponent.js```文件，可看到```createInternalComponent```方法，代码如下：
```javascript
/**
 * Get a host internal component class for a specific tag.
 *
 * @param {ReactElement} element The element to create.
 * @return {function} The internal class constructor function.
 */
function createInternalComponent(element) {
  !genericComponentClass ? process.env.NODE_ENV !== 'production' ? invariant(false, 'There is no registered component for the tag %s', element.type) : _prodInvariant('111', element.type) : void 0;
  return new genericComponentClass(element);
}
```
即返回```genericComponentClass```的一个实例，而```genericComponentClass```的来源，追寻源码，可以找到在```ReactDefaultInjection```中找到，实际上将```ReactDOMComponent```注入进来。
> ReactDOM源码中，作者将各种类型（如ReactEventListener、ReactDOMComponent等）抽象后通过Injection机制注入，我的理解是这样方便未来将类型整体升级替换，并且能一定程度上解耦（只需要保证类型对外提供的接口一致）。不知道是否理解有误... ...还望指教。

因此```instantiateReactComponent```的代码（2）处实际返回：```new ReactDOMComponent(node)```。
接下来阅读```ReactDOMComponent.js```文件：
先看```ReactDOMComponent```这个方法：
```javascript
/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @constructor ReactDOMComponent
 * @extends ReactMultiChild
 */
function ReactDOMComponent(element) {
  var tag = element.type;
  validateDangerousTag(tag);
  this._currentElement = element;
  this._tag = tag.toLowerCase();
  this._namespaceURI = null;
  this._renderedChildren = null;
  this._previousStyle = null;
  this._previousStyleCopy = null;
  this._hostNode = null;
  this._hostParent = null;
  this._rootNodeID = 0;
  this._domID = 0;
  this._hostContainerInfo = null;
  this._wrapperState = null;
  this._topLevelWrapper = null;
  this._flags = 0;
  if (process.env.NODE_ENV !== 'production') {
    this._ancestorInfo = null;
    setAndValidateContentChildDev.call(this, null);
  }
}

_assign(ReactDOMComponent.prototype, ReactDOMComponent.Mixin, ReactMultiChild.Mixin)
```
以上代码可以看到，```ReactDOMComponent```这个类继承了```ReactMultiChild```的```Mixin```。
元素挂载时，实际调用：```ReactDOMComponent.Mixin```中的```mountComponent```方法，整体源码如下：
```javascript
 /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {?ReactDOMComponent} the parent component instance
   * @param {?object} info about the host container
   * @param {object} context
   * @return {string} The computed markup.
   */
  mountComponent: function (transaction, hostParent, hostContainerInfo, context) {
    this._rootNodeID = globalIdCounter++;
    this._domID = hostContainerInfo._idCounter++;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    var props = this._currentElement.props;
    // 调整props至DOM的合法属性,并且处理事件
    switch (this._tag) {
      case 'audio':
      case 'form':
      case 'iframe':
      case 'img':
      case 'link':
      case 'object':
      case 'source':
      case 'video':
        this._wrapperState = {
          listeners: null
        };
        transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
        break;
      case 'input':
        ReactDOMInput.mountWrapper(this, props, hostParent);
        props = ReactDOMInput.getHostProps(this, props);
        transaction.getReactMountReady().enqueue(trackInputValue, this);
        transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
        break;
      case 'option':
        ReactDOMOption.mountWrapper(this, props, hostParent);
        props = ReactDOMOption.getHostProps(this, props);
        break;
      case 'select':
        ReactDOMSelect.mountWrapper(this, props, hostParent);
        props = ReactDOMSelect.getHostProps(this, props);
        transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
        break;
      case 'textarea':
        ReactDOMTextarea.mountWrapper(this, props, hostParent);
        props = ReactDOMTextarea.getHostProps(this, props);
        transaction.getReactMountReady().enqueue(trackInputValue, this);
        transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
        break;
    }

    assertValidProps(this, props);

    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    var namespaceURI;
    var parentTag;
    if (hostParent != null) {
      namespaceURI = hostParent._namespaceURI;
      parentTag = hostParent._tag;
    } else if (hostContainerInfo._tag) {
      namespaceURI = hostContainerInfo._namespaceURI;
      parentTag = hostContainerInfo._tag;
    }
    if (namespaceURI == null || namespaceURI === DOMNamespaces.svg && parentTag === 'foreignobject') {
      namespaceURI = DOMNamespaces.html;
    }
    if (namespaceURI === DOMNamespaces.html) {
      if (this._tag === 'svg') {
        namespaceURI = DOMNamespaces.svg;
      } else if (this._tag === 'math') {
        namespaceURI = DOMNamespaces.mathml;
      }
    }
    this._namespaceURI = namespaceURI;

    var mountImage;
    if (transaction.useCreateElement) {
      var ownerDocument = hostContainerInfo._ownerDocument;
      var el;
      if (namespaceURI === DOMNamespaces.html) {
        if (this._tag === 'script') {
          // Create the script via .innerHTML so its "parser-inserted" flag is
          // set to true and it does not execute
          var div = ownerDocument.createElement('div');
          var type = this._currentElement.type;
          div.innerHTML = '<' + type + '></' + type + '>';
          el = div.removeChild(div.firstChild);
        } else if (props.is) {
          el = ownerDocument.createElement(this._currentElement.type, props.is);
        } else {
          // Separate else branch instead of using `props.is || undefined` above becuase of a Firefox bug.
          // See discussion in https://github.com/facebook/react/pull/6896
          // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
          el = ownerDocument.createElement(this._currentElement.type);
        }
      } else {
        el = ownerDocument.createElementNS(namespaceURI, this._currentElement.type);
      }
      ReactDOMComponentTree.precacheNode(this, el);
      this._flags |= Flags.hasCachedChildNodes;
      if (!this._hostParent) {
        DOMPropertyOperations.setAttributeForRoot(el);
      }
      this._updateDOMProperties(null, props, transaction);
      var lazyTree = DOMLazyTree(el);
      this._createInitialChildren(transaction, props, context, lazyTree);
      mountImage = lazyTree;
    } else {
      var tagOpen = this._createOpenTagMarkupAndPutListeners(transaction, props);
      var tagContent = this._createContentMarkup(transaction, props, context);
      if (!tagContent && omittedCloseTags[this._tag]) {
        mountImage = tagOpen + '/>';
      } else {
        mountImage = tagOpen + '>' + tagContent + '</' + this._currentElement.type + '>';
      }
    }

    switch (this._tag) {
      case 'input':
        transaction.getReactMountReady().enqueue(inputPostMount, this);
        if (props.autoFocus) {
          transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
        }
        break;
      case 'textarea':
        transaction.getReactMountReady().enqueue(textareaPostMount, this);
        if (props.autoFocus) {
          transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
        }
        break;
      case 'select':
        if (props.autoFocus) {
          transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
        }
        break;
      case 'button':
        if (props.autoFocus) {
          transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
        }
        break;
      case 'option':
        transaction.getReactMountReady().enqueue(optionPostMount, this);
        break;
    }

    return mountImage;
  }
```