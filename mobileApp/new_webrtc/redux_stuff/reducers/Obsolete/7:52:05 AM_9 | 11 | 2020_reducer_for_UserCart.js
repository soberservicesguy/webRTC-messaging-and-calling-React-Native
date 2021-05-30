const initialState = {

	currentUserCart:{
		},

	totalUserCart: [
			{},
			{},
			{},
			{},
			{},
			{},
			{},
			{},
			{},
			{},
		]
	}

const reducerForUserCart = (state = initialState, action) => {

	switch (action.type) {

		case "ADD_UserCart":

			return {...state, totalUserCart: [...state.totalUserCart, action.usercart] }
			break;

		case "REMOVE_UserCart":

			return {...state, totalUserCart: [...state.totalUserCart.filter( (item) => item.id !== action.usercart_id ) ] }
			break;

		case "SET_FETCHED_UserCart":

			return {...state, totalUserCart: action.usercart_list}
			break;

		case "SET_FETCHED_10_MORE_UserCart":

			return {...state, totalUserCart: [...state.UserCart, action.usercart_list] }
			break;

		case "SET_CURRENT_UserCart":

			return {...state, currentUserCart: action.current_usercart}
			break;

		default:

			return state

	}

};

export default reducerForUserCart;
