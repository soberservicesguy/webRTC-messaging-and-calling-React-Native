const initialState = {

	currentProduct:{
			image_thumbnail:'dummy',
			product_name:'dummy',
			price:'dummy',
			endpoint:'dummy',
		},

	totalProduct: [
			{ image_thumbnail:'dummy1', product_name:'dummy1', price:'dummy1', endpoint:'dummy1',},
			{ image_thumbnail:'dummy2', product_name:'dummy2', price:'dummy2', endpoint:'dummy2',},
			{ image_thumbnail:'dummy3', product_name:'dummy3', price:'dummy3', endpoint:'dummy3',},
			{ image_thumbnail:'dummy4', product_name:'dummy4', price:'dummy4', endpoint:'dummy4',},
			{ image_thumbnail:'dummy5', product_name:'dummy5', price:'dummy5', endpoint:'dummy5',},
			{ image_thumbnail:'dummy6', product_name:'dummy6', price:'dummy6', endpoint:'dummy6',},
			{ image_thumbnail:'dummy7', product_name:'dummy7', price:'dummy7', endpoint:'dummy7',},
			{ image_thumbnail:'dummy8', product_name:'dummy8', price:'dummy8', endpoint:'dummy8',},
			{ image_thumbnail:'dummy9', product_name:'dummy9', price:'dummy9', endpoint:'dummy9',},
			{ image_thumbnail:'dummy10', product_name:'dummy10', price:'dummy10', endpoint:'dummy10',},
		]
	}

const reducerForProduct = (state = initialState, action) => {

	switch (action.type) {

		case "ADD_Product":

			return {...state, totalProduct: [...state.totalProduct, action.product] }
			break;

		case "REMOVE_Product":

			return {...state, totalProduct: [...state.totalProduct.filter( (item) => item.id !== action.product_id ) ] }
			break;

		case "SET_FETCHED_Product":

			return {...state, totalProduct: action.product_list}
			break;

		case "SET_FETCHED_10_MORE_Product":

			return {...state, totalProduct: [...state.Product, action.product_list] }
			break;

		case "SET_CURRENT_Product":

			return {...state, currentProduct: action.current_product}
			break;

		default:

			return state

	}

};

export default reducerForProduct;
