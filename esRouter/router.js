(function(window, document, undefined){
  class Router {
    constructor(el, render, config){
      this.el = el;
      this._render = this._enhanceRender(render || this._defaultRender);
      this.config = config;
      this.cacheView = [];

      this.Init();
    }

    push(path){
      // 暂时规定path为路径，不包含域名
      let compactView = this.getCompactView(path);
      this._render(compactView);
    }

    /**
     * 增强render函数，可在render前后执行各种自定义事务，如统计渲染耗时等等
     * @param {*func} render
     */
    _enhanceRender(render){
      return (view) => {
        this.cacheView.push(view);
        render(this.el, view);
      }
    }

    Init(){
      let compactView = this.getCompactView();
      this._render(compactView);
    }

    getCompactView(url){
      if(url){
        return url
      }

      return 'compact'
    }

    _defaultRender(content){
      console.log(content.toString())
    }
  }

  window.Router = Router
})(window, document)