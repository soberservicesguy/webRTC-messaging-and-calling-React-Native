require('../models/user')
const mongoose = require('mongoose');
const router = require('express').Router();

const User = mongoose.model('User');

const { my_logger } = require('../handy_functions/my_custom_logger')

const {
	create_room_and_add_users,
} = require('../handy_functions/database_functions')

router.post('/create-room', async function(req, res, next){
	try {
		let room_string = req.body.room_string
		let user_object = await create_room_and_add_users(room_string)
		res.status(200).json({msg: 'OK'})

	} catch (err) {
		console.log('------------------------error while creating room--------------------')
		console.log(err)
		res.status(200).json({msg: err})
	}
})

router.get('/join-room', function(req, res, next){

	my_logger(null, null, 'function_entering', '/join-room', 0)

	try{

		
		my_logger( 'req.query', req.query, 'value', '/join-room' , 0)
		// console.log('PAYLOAD IS BELOW')
		// console.log(req.query)
		
		var all_rooms_to_join = []

		User.findOne({ user_phone_number: req.query.user_phone_number })
		.then((user) => {

			my_logger( 'user', user, 'value', '/join-room' , 0)
			// console.log(user)

			if (!user) {

				// res.status(401).json({ success: false, msg: "could not find user" });

			} else {

				let rooms_of_user = user.rooms
				rooms_of_user.map((room_object) => {
					let room_string = room_object.room_string
					all_rooms_to_join.push( room_string )
				})

				my_logger('all_rooms_to_join', all_rooms_to_join, 'function_returning', '/join-room', 0)
				res.status(200).json(all_rooms_to_join);

			}

		})
		.catch((error) => {

			my_logger('error', error, 'error', '/join-room', 0)
			next(error);

		});		

		// my_logger('returned_value', returned_value, 'function_returning', '/join-room', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', '/join-room', 0)

	}

	my_logger(null, null, 'function_exiting', '/join-room', 0)

});



module.exports = router;