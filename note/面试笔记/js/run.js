function run(taskDef){
    var task = taskDef();
    
    var result = task.next();

    function step(){
        if(!result.done){
            if(typeof result.value === 'function'){
                result.value(function(err, data){
                    if(err){
                        result.throw(err)
                        return
                    }else{
                        result.next(data)
                        step()
                    }
                })
            }else{
                result.next(result.value)
                step()
            }
        }
    }
    step()
}