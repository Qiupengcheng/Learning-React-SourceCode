function *fibo(n){
    var i = 0,
        j = 1,
        result;
    yield i;
    yield j;
    while(n--){
        result = i + j;
        i = j;
        j = result;
        yield result
    }
}

// var ff = fibo();
// for(let i=0; i<10; i++){
//     console.log(ff.next())
// }
for(let n of fibo(10)){
    console.log(n);
}