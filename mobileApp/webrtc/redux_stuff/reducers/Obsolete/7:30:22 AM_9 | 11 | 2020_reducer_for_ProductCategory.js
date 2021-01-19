const initialState = {

	currentProductCategory:{
			image_thumbnail:'dummy',
			category_name:'dummy',
			endpoint:'dummy',
		},

	totalProductCategory: [
			{ image_thumbnail:'dummy1', category_name:'dummy1', endpoint:'dummy1',},
			{ image_thumbnail:'dummy2', category_name:'dummy2', endpoint:'dummy2',},
			{ image_thumbnail:'dummy3', category_name:'dummy3', endpoint:'dummy3',},
			{ image_thumbnail:'dummy4', category_name:'dummy4', endpoint:'dummy4',},
			{ image_thumbnail:'dummy5', category_name:'dummy5', endpoint:'dummy5',},
			{ image_thumbnail:'dummy6', category_name:'dummy6', endpoint:'dummy6',},
			{ image_thumbnail:'dummy7', category_name:'dummy7', endpoint:'dummy7',},
			{ image_thumbnail:'dummy8', category_name:'dummy8', endpoint:'dummy8',},
			{ image_thumbnail:'dummy9', category_name:'dummy9', endpoint:'dummy9',},
			{ image_thumbnail:'dummy10', category_name:'dummy10', endpoint:'dummy10',},
		]
	}

const reducerForProductCategory = (state = initialState, action) => {

	switch (action.type) {

		case "ADD_ProductCategory":

			return {...state, totalProductCategory: [...state.totalProductCategory, action.productcategory] }
			break;

		case "REMOVE_ProductCategory":

			return {...state, totalProductCategory: [...state.totalProductCategory.filter( (item) => item.id !== action.productcategory_id ) ] }
			break;

		case "SET_FETCHED_ProductCategory":

			return {...state, totalProductCategory: action.productcategory_list}
			break;

		case "SET_FETCHED_10_MORE_ProductCategory":

			return {...state, totalProductCategory: [...state.ProductCategory, action.productcategory_list] }
			break;

		case "SET_CURRENT_ProductCategory":

			return {...state, currentProductCategory: action.current_productcategory}
			break;

		default:

			return state

	}

};

export default reducerForProductCategory;
