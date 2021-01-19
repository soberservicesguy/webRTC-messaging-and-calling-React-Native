// function indenter(string, indent_level){
// 	let final_string = string
	
// 	if ( indent_level > 0 ){
// 		let iterations = [ ...Array(indent_level).keys() ]	

// 		// for loop
// 		for (let i = 0; i < iterations.length; i++) {
// 			final_string = '\t' + final_string 
// 		} 
		

// 	} else {

// 		final_string = string

// 	}
	
// 	return final_string

// }

// function my_logger(key, the_value, log_type, function_name, additional_intent){

// 	let function_entering = true // auto
// 	let function_exiting = true // auto
// 	let error = true // auto
// 	let value = false
// 	let function_returning = false // auto
// 	let alerts = true
// 	let special_value = true


// 	if ( log_type === 'value' &&  value === true ){

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------Value From ' + function_name + ' Function--------------------', additional_intent) )
// 		console.log( indenter('\t value of ' + key, additional_intent) )
// 		console.log( indenter(`\t\t${the_value}`, additional_intent) )

// 	} else if ( log_type === 'special_value' &&  special_value === true ) {

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------SPECIAL Value From ' + function_name + ' Function--------------------', additional_intent) )
// 		console.log( indenter('\t value of ' + key, additional_intent) )
// 		console.log( indenter(`\t\t${the_value}`, additional_intent) )

// 	} else if ( log_type === 'alert' &&  alerts === true ) {

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------Function Called Within From ' + function_name + ' Function--------------------', additional_intent) )
// 		console.log( indenter('\t called functions name is ' + key , additional_intent) )
// 		console.log( indenter(`\t\t function call detail is ${the_value}`, additional_intent) )


// 	} else if ( log_type === 'error' &&  error === true ) {

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------Error From ' + function_name + ' Function--------------------', additional_intent) )
// 		console.log( indenter('\t error from ' + key , additional_intent) )
// 		console.log( indenter(`\t\t${the_value}`, additional_intent) )

// 	} else if ( log_type === 'function_entering' &&  function_entering === true ) {

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------Entering ' + function_name + ' Function--------------------', additional_intent) )

// 	} else if ( log_type === 'function_exiting' &&  function_exiting === true ) {

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------Exiting ' + function_name + ' Function--------------------', additional_intent) )

// 	} else if ( log_type === 'function_returning' &&  function_returning === true ) {

// 		console.log( indenter('\n', additional_intent) )
// 		console.log( indenter('LOG::::-------------------Return Value From ' + function_name + ' Function--------------------', additional_intent) )
// 		console.log( indenter('\t value of ' + key, additional_intent) )
// 		console.log( indenter(`\t\t${the_value}`, additional_intent) )

// 	}

// }



// module.exports = {
// 	my_logger
// }
// // export default my_logger










function my_logger(key, the_value, log_type, function_name){

	// let error = false // auto
	// let value = true
	// let function_entering = false // auto
	// let function_exiting = false // auto
	// let function_returning = true // auto

	// if ( log_type === 'value' &&  value === true ){

	// 	console.log('\n')
	// 	console.log('LOG::::-------------------Value From ' + function_name + ' Function--------------------')
	// 	console.log('\t value of ' + key)
	// 	console.log(`\t\t${the_value}`)

	// } else if ( log_type === 'error' &&  error === true ) {

	// 	console.log('\n')
	// 	console.log('LOG::::-------------------Error From ' + function_name + ' Function--------------------')
	// 	console.log('\t error from ' + key )
	// 	console.log(`\t\t${the_value}`)

	// } else if ( log_type === 'function_entering' &&  function_entering === true ) {

	// 	console.log('\n')
	// 	console.log('LOG::::-------------------Entering ' + function_name + ' Function--------------------')

	// } else if ( log_type === 'function_exiting' &&  function_exiting === true ) {

	// 	console.log('\n')
	// 	console.log('LOG::::-------------------Exiting ' + function_name + ' Function--------------------')

	// } else if ( log_type === 'function_returning' &&  function_returning === true ) {

	// 	console.log('\n')
	// 	console.log('LOG::::-------------------Return Value From ' + function_name + ' Function--------------------')
	// 	console.log('\t value of ' + key)
	// 	console.log(`\t\t${the_value}`)

	// }

}



module.exports = {
	my_logger
}
// export default my_logger