# 主要方法记录

> instantiateReactComponent.js -> instantiateReactComponent ，传入ReactElement类型，返回可以挂载的实例
根据ReactElement的类型，分为集中类型的元素: 
    ReactDOMComponent(html原生元素)、
    ReactDOMTextComponent(文本元素)、
    ReactCompositeComponent(自定义元素)
每种均对外暴露自己的mountComponent方法，用以将自己转化成对应的domElement

> ReactInjection 是干嘛的...

> ReactDOMComponent.js

> ReactCompositeComponent.js

> ReactMount.js -> mountComponentIntoNode，挂载组件，并插入DOM中

