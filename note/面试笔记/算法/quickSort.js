function quickSort(array){
    return quick(array, 0, array.length -1)
}

function quick(array, left, right){
    var length = array.length,
        index;
    if(length>1){
        index = partition(array, left, right)
        if(left < index-1){
            quick(array, left, index-1)
        }

        if(index < right){
            quick(array, index, right)
        }
    }
}

function partition(array, left, right){
    var length = array.length,
        privot = array[Math.floor((left + right)/2)], // 主元
        i = left,
        j = right;

    while(i<=j){
        while(array[i]<privot){
            i++
        }
        while(array[j]>privot){
            j++
        }
        if(i<=j){
            swapQuickSort(array, i, j);
            i++;
            j--;
        }
    }
    return i
}

function swapQuickSort(array, i, j){
    var proxy = array[i];
    array[i] = array[j];
    array[j] = proxy;
}

var list = [312,412,4,1235,134,5,3425,234,5,3425,324,634,5,314,213,4];

var sortList = quickSort(list)
console.log(sortList);