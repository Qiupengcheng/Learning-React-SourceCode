function *triangel(n){
    let L = [1];
    while(true){
        yield L;
        L = calNext(L);
        if(L.length>n){
            break;
        }
    }
}

function calNext(prev){
    return [1, ...prev.map((item, index) => 
        index === 0?null:(item+prev[index-1])
    ).slice(1), 1];
}

for(a of triangel(10)){
    console.log(a);
}