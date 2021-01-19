// 		/rooms

// require('../models/user');
// require('../models/usercart');

require('../models/message')
// require('../models/room')

const mongoose = require('mongoose');
const router = require('express').Router();

const Message = mongoose.model('Message');
const Room = mongoose.model('Room');

const {
	create_namespace_if_not_exists,
	create_room_if_not_exists,
} = require('../handy_functions/database_functions')

const { my_logger } = require('../handy_functions/my_custom_logger')



// router.get('/save-message', function(req, res, next){

// 	console.log('PAYLOAD IS BELOW')
// 	console.log(req.query)

// 	var all_rooms_to_join = []

// 	Message.findOne({ user_phone_number: req.query.user_phone_number })
// 	.then((user) => {

// 		console.log('USER FOUND')
// 		console.log(user)

// 		if (!user) {

// 			// res.status(401).json({ success: false, msg: "could not find user" });

// 		} else {

// 			let rooms_of_user = user.rooms
// 			rooms_of_user.map((room_object) => {
// 				let room_string = room_object.room_string
// 				all_rooms_to_join.push( room_string )
// 			})

// 			res.status(200).json(all_rooms_to_join);

// 		}

// 	})
// 	.catch((err) => {

// 		next(err);

// 	});
// });



// {user_phone_number: user_phone_number, user_name: user_name, display_picture: display_picture}
// 	message_state, sent_time, text, sent_by, room_string
router.post('/save-message', async function(req, res, next){
	// let number1_pattern = /\d+(?=\-)/
	// let number1 = req.body.room_string.match( number1_pattern )

	// let number2_pattern = /\d+(?=\+)/
	// let number2 = req.body.room_string.match( number2_pattern )

	// let _room_string = ( Number(number1) < Number(number2) ) ? `${number1}-${number2}` : `${number2}-${number1}`

	my_logger(null, null, 'function_entering', '/save-message', 0)

	try{

		var room_object = {}

		Room.findOne({ endpoint: req.body.room_string })
		.then(async (room) => {

			if (!room) {

				let user_details_list = req.body.user_details_list
				
				// user_details_list.map((user_details_object) => {
					// var newRoom = await create_room_if_not_exists(user_details_object)	
				// })
				my_logger('create_room_if_not_exists', {arg_passed:'user_details_list', arg:JSON.stringify(user_details_list)}, 'alert', '/save-message', 1)
				var newRoom =  await create_room_if_not_exists( user_details_list )

				// var newRoom = await create_room_if_not_exists([{
				// 	user_phone_number: req.body.user_phone_number,
				// 	user_name: req.body.user_name,
				// 	display_picture: req.body.display_picture,
				// }])

				// // create room
				// const newRoom = new Room({

				// 	_id: new mongoose.Types.ObjectId(),
				// 	room_string: req.body.room_string,
				// 	// ASSIGN BOTH USERS TOO TO THE ROOM


				// });
				// COMMENTED OUT SINCE ABOVE FUNCTION IS SAVING
				// newRoom.save(function (err1, newRoom) {
				// 	if (err1){
				// 		my_logger('just message2', {msg:'executed till here2'}, 'value', '/save-message', 0)
				// 		my_logger(`err1`, err1, 'error', '/save-message', 0)
				// 		res.status(501).json({ success: false, msg: "couldnt save new room for message" });
				// 		// return console.log(err);
				// 	}
				// })

				room_object = newRoom

			} else {

				room_object = room

			}

			my_logger('just message', {msg:'executed till here'}, 'value', '/save-message', 0)
			return room_object
		})
		.then((room_object) => {

			my_logger('just message1', {msg:'executed till here1'}, 'value', '/save-message', 0)
			const newMessage = new Message({

				_id: new mongoose.Types.ObjectId(),
				room_string: req.body.room_string,
				message_state: req.body.message_state,
				sent_time: req.body.sent_time,
				text: req.body.text,
				// sent_by: req.body.sent_by,
				senders_details: req.body.senders_details,
				room: room_object,
				// senders_detail: number1,
			})

			newMessage.save(function (error, newUser) {
				if (error){
					// COMMENTED OUT SINCE IT SAYS CANT SET HEADERS
					// res.status(501).json({ success: false, msg: "couldnt save message" });
					my_logger(`error`, error, 'error', '/save-message', 0)
					my_logger(`{ success: false, msg: "couldnt save message" }`, { success: false, msg: "couldnt save message" }, 'error', '/save-message', 0)
					// return console.log(error);

				}

				// console.log(`Message saved`)
				// my_logger('value', { success: true, msg: "message saved" }, 'function_returning', '/save-message', 0)
				my_logger('just message3', {msg:'executed till here3'}, 'value', '/save-message', 0)
				res.status(200).json({ success: true, msg: "message saved" });
				// res.send('ok')

			});
		})
	

		// my_logger('returned_value', returned_value, 'function_returning', '/save-message', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', '/save-message', 0)

	}

	my_logger(null, null, 'function_exiting', '/save-message', 0)
	
});



module.exports = router;