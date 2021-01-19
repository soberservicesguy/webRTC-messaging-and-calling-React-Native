const initialState = {

	currentUser:{
			image_thumbnail:'dummy',
			user_name:'dummy',
			user_password:'dummy',
			endpoint:'dummy',
		},

	totalUser: [
			{ image_thumbnail:'dummy1', user_name:'dummy1', user_password:'dummy1', endpoint:'dummy1',},
			{ image_thumbnail:'dummy2', user_name:'dummy2', user_password:'dummy2', endpoint:'dummy2',},
			{ image_thumbnail:'dummy3', user_name:'dummy3', user_password:'dummy3', endpoint:'dummy3',},
			{ image_thumbnail:'dummy4', user_name:'dummy4', user_password:'dummy4', endpoint:'dummy4',},
			{ image_thumbnail:'dummy5', user_name:'dummy5', user_password:'dummy5', endpoint:'dummy5',},
			{ image_thumbnail:'dummy6', user_name:'dummy6', user_password:'dummy6', endpoint:'dummy6',},
			{ image_thumbnail:'dummy7', user_name:'dummy7', user_password:'dummy7', endpoint:'dummy7',},
			{ image_thumbnail:'dummy8', user_name:'dummy8', user_password:'dummy8', endpoint:'dummy8',},
			{ image_thumbnail:'dummy9', user_name:'dummy9', user_password:'dummy9', endpoint:'dummy9',},
			{ image_thumbnail:'dummy10', user_name:'dummy10', user_password:'dummy10', endpoint:'dummy10',},
		]
	}

const reducerForUser = (state = initialState, action) => {

	switch (action.type) {

		case "ADD_User":

			return {...state, totalUser: [...state.totalUser, action.user] }
			break;

		case "REMOVE_User":

			return {...state, totalUser: [...state.totalUser.filter( (item) => item.id !== action.user_id ) ] }
			break;

		case "SET_FETCHED_User":

			return {...state, totalUser: action.user_list}
			break;

		case "SET_FETCHED_10_MORE_User":

			return {...state, totalUser: [...state.User, action.user_list] }
			break;

		case "SET_CURRENT_User":

			return {...state, currentUser: action.current_user}
			break;

		default:

			return state

	}

};

export default reducerForUser;
