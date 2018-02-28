
// 切分数组并合并
function mergeSortRec(array){
    var length = array.length;
    if(length === 1){
        return array
    }

    var mid = Math.floor(length/2),
        left = array.slice(0, mid),
        right = array.slice(mid, length);

    return merge(mergeSortRec(left), mergeSortRec(right))
}

// 合并两个数组
function merge(left, right){
    var result = [],
        il = 0,
        ir = 0,
        leftLength = left.length,
        rightLength = right.length;

    while(il < leftLength && ir < rightLength){
        if(left[il] < right[ir]){
            result.push(left[il])
            il++
        }else{
            result.push(right[ir])
            ir++
        }
    }

    while(il < leftLength){
        result.push(left[il])
        il++
    }

    while(ir < rightLength){
        result.push(right[ir])
        ir++
    }
    
    return result
}