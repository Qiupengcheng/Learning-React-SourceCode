### http2.0 相比 http1.1 的优势

HTTP2.0实现多路复用单一长连接，避免http请求多的时候，频繁建立TCP连接的网络开销；
> 对于前端来说，不需要合并资源了，更容易通过缓存实现二次访问的性能提升。

头部压缩，减少每一次请求的体积

server push， 不需要轮询了


### CORS 
通过请求头的Origin和服务器返回的响应头Access-Control-Allow-Origin来控制跨域
区分简单请求、非简单请求、带身份凭证的请求几种情况。

##### 符合以下条件的为简单请求：
* 请求方式为：GET、POST、HEAD 之一
* 请求头仅包含对CORS安全的首部字段集合
* Content-Type的值为以下三者之中： 'text/plain'、'multipart/form-data'、'application/x-www-form-urlencoded'

简单请求无预检请求，直接将请求发送至服务端，并通过返回的Access-Control-Allow-Origin判断当前请求是否被允许

##### 其余请求为非简单请求：
非简单请求在请求开始，会先使用OPTIONS方法发送一个预检请求
预检请求中包含：
* Origin
* Access-Control-Request-Method (请求方法)
* Access-Control-Request-Headers CORS安全首部字段以外的header

响应返回Access-Control-Allow-Origin的值，如包含Origin，则可以开始正式请求。

##### 当请求需要带上cookie的时候，
XMLHTTPRequest对象需要设置 
```javascript
var xhr = new XMLHTTPRequest(); 
xhr.withCredentials = true // CORS时带上cookie
```
Fetch需要设置
```javascript
fetch(url, {
    method: 'POST',
    credentials: 'include'
})
```
请求会先预检请求，包含Cookie字段，服务端返回Access-Control-Allow-Credentials为true，则为允许携带，然后正常进行请求。


### HTTPS
在TCP层与应用层协议中间，增加一层安全协议层 SSL/TLS ，HTTPS就是HTTP+SSL/TLS

在HTTP协议中，存在以下几种问题：
* TCP传输中的内容有可能被窃听
* 请求、响应的报文被篡改
* 请求方无鉴权

HTTP协议本身并没有办法解决这些问题，于是在前置一层SSL/TLS协议以保证网络请求的安全性，统称为HTTPS。
主要步骤如下：
* 1、客户端发起请求（发送clientHello报文，包含客户端支持的SSL、TLS版本、加密组件）
* 2、服务端支持制定版本SSL、TLS的时候，响应制定版本及加密组件
* 3、服务端发送Certificate报文，包含公开密钥证书
* 4、服务端发送Server Hello Done报文
* 5、客户端向认证机构确认证书有效性，确认有效则发送Pre-master-key（即客户端生成的随机数），并使用公钥加密，发送给服务端
* 6、服务端接收到Pre-master-key，服务端使用私钥对Pre-master-key进行解密，
* 7、服务端、客户端分别使用此前服务端发送的公钥对Pre-master-key进行加密，生成了共享密钥
* 8、HTTPS连接完成

HTTPS比HTTP慢，原因在于：
* 1、建立HTTPS的耗时；（需要在HTTP、SSL/TLS、TCP之间通信，通信耗时增加）
* 2、对报文的加密、解密过程耗时；（有专门加、解密HTTPS的硬件）