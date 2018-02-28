> 系列文章：[Web缓存系列](http://www.alloyteam.com/2012/03/web-cache-1-web-cache-overview/)

### Web缓存：
#### 1、数据库缓存
#### 2、服务端缓存：
* 1、代理服务器缓存; 
* 2、CDN缓存；
#### 3、浏览器端缓存；
##### 浏览器缓存控制
**使用HTTP请求和响应头：**
Pragma **响应头** 告诉浏览器忽略资源的缓存副本（HTTP1.0的旧字段）
Expires **响应头** 告诉浏览器过期时间（多久之内可以直接使用浏览器缓存副本，层级较低，**效果会被Cache-Control覆盖**）， 不需要发送请求确认
Cache-Control **响应头** 缓存控制字段，有以下值
  * no-cache: 无视Expires，强制每次获取资源与服务器协商缓存
  * no-store: 不缓存资源的副本
  * max-age: 缓存副本的有效时长 **不会发出请求确认** 优先级高于Expires
  * public: 任何途径的缓存者
  * private: 仅单个用户或实体缓存
Last-Modified **响应头** 告诉浏览器资源最后修改时间
If-Modified-Since **请求头** 如果上一次响应有Last-Modified，则本次请求同一资源时，将该值作为本字段的值传出

ETag **响应头** 告知浏览器当前资源在服务器的唯一标识符
If-None-Match **请求头** 如果上一次响应有ETag，则本次请求同一资源时，将该值作为本字段的值传出

Vary **响应头** 辅助从多个缓存副本中筛选合适的版本


##### 一些总结：
* 用户点刷新时，浏览器会忽略Expires/max-age的缓存规则，重新向服务器发起请求

##### Last-Modified与Etag
* Last-Modified只能精确到秒级，当一个资源1s内频繁更改的时候，Last-Modified将失效
* 当一个文件定期更新，但内容实际没有变化时，将导致缓存失效
* 可能服务器或代理服务器时间获取错误的情况头发反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复反反复复吩咐                                                                                                                                                                                 r
##### 用户操作不同，缓存策略也不同：
* 在地址栏回车、页面连接跳转、新开窗口、前进后退时，Expires/Cache-Control、Last-Modified/Etag都有效
* F5刷新时，Expires/Cache-Control无效，Last-Modified/Etag保持有效
* Ctrl-F5刷新时，全部缓存无效


#### HTML5 离线应用Manifest
1、在服务器添加MIME TYPE支，让服务器能够识别manifest后缀的文件
2、创建一个后缀名为.manifest的文件，把需要缓存的文件按格式卸载里面，并用注释行标注版本
3、给<html>标签加manifest属性，并引用manifest文件
<html manifest="path/to/name-of.manifest">