// function give_debug_log(target_function){
function give_debug_log(debug_arg){

	// function wrapper_function( ...args ){ // all args taken from some_function
	function wrapper_function(target_function, ...function_args){ // all args taken from some_function
		
		console.log(`Entered the function ${target_function} with arguments ${function_args}`)

		try{

			let result = target_function( args )

		} catch (error) {

			console.log(`Error caught from the function ${target_function} is ${error}`)

		}

		console.log(`Returned value from the function ${target_function} is ${result}`)

		console.log(`Exiting the function ${target_function}`)

		return result

	}

	// return wrapper_function(...args)
	return wrapper_function(target_function)
}


function some_function(something){
	console.log(something)
}

@give_debug_log('something')
some_function('Arsalan')