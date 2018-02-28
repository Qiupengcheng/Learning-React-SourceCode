// 散列表对key进行散列算法，然后存储到指定位置，以下为一种简单散列算法
function loseloseHash(key){
    var hashResult = 0;
    for(var i=0, len=key.length; i<len; i++){
        hashResult += key.charCodeAt(i);
    }
    return hashResult % 36
}

/**
 * 然而，key散列后，可能存在两个重复的值，即所谓的冲突，因此，需要考虑散列冲突解决方案
 * 现常用解决方案有三种：
 *  1、分离链接
 *  2、线性探查
 *  3、双散列法
 */

/**
 * 分离链接法
 * 散列表的每个位置创建一个链表，并将元素的ValuePair存储在里面
 */

/**
 * 线性探查
 * 当加入的index位置已经存在元素，就往index+1、index+2位置一直往后查找直到查到空位，将元素的ValuePair存在该位置
 */

