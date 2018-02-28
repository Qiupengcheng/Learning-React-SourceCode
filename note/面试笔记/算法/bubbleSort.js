// 冒泡排序
function bubbleSort(array){
    if(!array || array.length === 0){
        return []
    }

    var len = array.length,
        endTag,
        proxy;

    for(var i=0; i<len; i++){
        endTag = len-i-1
        for(var j=0; j<endTag; j++){
            if(array[j] > array[j+1]){
                proxy = array[j]
                array[j] = array[j+1]
                array[j+1] = proxy
            }
        }
    }
    return array
}

var arr = [321,5 ,534,52,43,54,2624,5,4326,24352,47,2546,354]
console.log(bubbleSort(arr));