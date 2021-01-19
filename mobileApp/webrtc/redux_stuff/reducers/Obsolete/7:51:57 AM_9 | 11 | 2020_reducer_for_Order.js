const initialState = {

	currentOrder:{
		},

	totalOrder: [
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

const reducerForOrder = (state = initialState, action) => {

	switch (action.type) {

		case "ADD_Order":

			return {...state, totalOrder: [...state.totalOrder, action.order] }
			break;

		case "REMOVE_Order":

			return {...state, totalOrder: [...state.totalOrder.filter( (item) => item.id !== action.order_id ) ] }
			break;

		case "SET_FETCHED_Order":

			return {...state, totalOrder: action.order_list}
			break;

		case "SET_FETCHED_10_MORE_Order":

			return {...state, totalOrder: [...state.Order, action.order_list] }
			break;

		case "SET_CURRENT_Order":

			return {...state, currentOrder: action.current_order}
			break;

		default:

			return state

	}

};

export default reducerForOrder;
