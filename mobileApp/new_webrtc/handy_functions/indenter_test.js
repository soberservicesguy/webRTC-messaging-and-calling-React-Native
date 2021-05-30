function indenter(string, indent_level){
	let final_string = string
	
	if ( indent_level > 0 ){
		let iterations = [ ...Array(indent_level).keys() ]	

		// for loop
		for (let i = 0; i < iterations.length; i++) {
			final_string = '\t' + final_string 
		} 
		

	} else {

		final_string = string

	}
	
	return final_string

}


console.log( indenter('this is', 2) )