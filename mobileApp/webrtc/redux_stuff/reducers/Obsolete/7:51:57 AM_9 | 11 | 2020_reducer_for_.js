const initialState = {

	current:{
		},

	total: [
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

const reducerFor = (state = initialState, action) => {

	switch (action.type) {

		case "ADD_":

			return {...state, total: [...state.total, action.] }
			break;

		case "REMOVE_":

			return {...state, total: [...state.total.filter( (item) => item.id !== action._id ) ] }
			break;

		case "SET_FETCHED_":

			return {...state, total: action._list}
			break;

		case "SET_FETCHED_10_MORE_":

			return {...state, total: [...state., action._list] }
			break;

		case "SET_CURRENT_":

			return {...state, current: action.current_}
			break;

		default:

			return state

	}

};

export default reducerFor;
