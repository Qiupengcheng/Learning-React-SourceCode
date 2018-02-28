##### 块级元素与行内元素
区别：
* 块级元素宽度默认占满父系宽度，行内元素则为内容宽度
* 行内元素内只能容纳行内元素

##### 清楚浮动影响
以下代码，会清除浮动带来的父元素高度塌陷，而且还消除了父元素与子元素在竖直方向的margin重叠
```css
.clearfix:before, .clearfix:after {
    content: '';
    display: table;
}

.clearfix:after {
    clear: both;
}
```

##### 盒模型
盒模型分为标准盒模型与IE的盒模型
两种盒子都有以下几部分（由内而外）：
* 内容盒子
* padding内边距
* border边框
* margin外边距

标准模式下，默认height、width都是内容盒子
IE模式下，默认height、width时border盒子

为了兼容IE，一般使用box-sizing: border-box; 保证两个盒子的height、width一致


##### href和src的区别？title和alt的区别
href指定网络资源的位置，从而在当前元素或当前文档和由当前属性定义的需要的锚点或者资源之间定义的一个链接或者关系，在link和a上使用
src属性仅仅嵌入当前资源到当前文档元素定义的位置，是页面必不可少的一部分，是引入，在img、script、iframe上使用

title作为语义化的组成部分，作为标签时表示文档的标题，作为属性，则为元素提供额外的信息说明
alt是属性，用来指定替换文字的，只能用在img、area、input元素中，用于网页中无法显示时给用户提供的文字说明，一种降级处理方案

##### 简述前端优化的方式 旧的雅虎34条|h5新添加的方式
1、尽量减少HTTP请求次数  // 合并资源，但需要注意粒度，保证能命中缓存 
2、减少DNS查找次数  // 域名收敛
3、避免跳转 
4、可缓存的AJAX
5、推迟加载内容
6、预加载
7、减少DOM元素数量  // 尽量降低层级 
8、根据域名划分页面内容
9、使iframe的数量最小
10、不要出现404错误
11、使用内容分发网络
12、为文件头指定Expires或Cache-Control 
13、Gzip压缩文件内容
14、配置ETag
15、尽早刷新输出缓冲
16、使用GET来完成AJAX请求
17、把样式表置于顶部
18、避免使用CSS表达式（Expression）
19、使用外部JavaScript和CSS
20、削减JavaScript和CSS
21、用<link>代替@import
22、避免使用滤镜
23、把脚本置于页面底部
24、剔除重复脚本