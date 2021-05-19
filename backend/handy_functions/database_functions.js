require('../models/room');
require('../models/message');
require('../models/user');

// require('../models/');
const mongoose = require('mongoose');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');
const User = mongoose.model('User')
// function store_socket_in_db_if_not_in_it(socket){
// 	Socket.findOne( { socket_id: socket.id } )
// 	.then((socket_object) => {

// 		if (socket_object === null) {
// 			const newSocket = new Socket({
// 				_id: new mongoose.Types.ObjectId(),
// 				socket_object: socket,
// 			});      

// 			console.log('socket_object NOT found from store_socket_in_db_if_not_in_it function')

// 			newSocket.save(function (err, newRoom) {
// 				if (err) return console.log(err);
// 			});

// 			return newSocket

// 		} else {

// 			console.log('socket_object found from store_socket_in_db_if_not_in_it function')
// 			console.log(socket_object)
// 			console.log('')

// 			return socket_object
// 		}

// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});
// }

const { my_logger } = require('./my_custom_logger')

async function create_user_if_not_exists(phone_number){
	let required_user = {}

	return User.findOne({ user_phone_number: phone_number })
	.then( async (user) => {
		if (user) {
			console.log('===============USER FOUND=================')
			required_user = user

		} else {
			const newUser = new User({

				_id: new mongoose.Types.ObjectId(),
				user_phone_number: phone_number,

			});

			newUser.save(async function (error, newRoom) {
				if (error){
					// return error
					console.log(error)
				}
			})

			required_user = newUser
			console.log('===============USER CREATED=================')
		}
		return required_user
	})

}

async function create_room_and_add_users(room_string){
	let required_room = {}
	let room_users = []
	let numbers = []
	let number1_pattern = /\d+(?=\-)/
	let number1 = room_string.match( number1_pattern )
	numbers.push(number1[0])

	let number2_pattern = /\d+(?=\+)/
	let number2 = room_string.match( number2_pattern )
	numbers.push(number2[0])

	let user_object = {}
	numbers.map( async (number) => {
		console.log('--------------number arg for creating user-------------- ')
		console.log(number)
		user_object = await create_user_if_not_exists(number)
		console.log('===============PUSHING BELOW USER==================')
		console.log(user_object)
		room_users.push( user_object )
	})


	return Room.findOne({ room_string: room_string })
	.then((room) => {


		if (room) {

			required_room = room

		} else {

			const newRoom = new Room({

				_id: new mongoose.Types.ObjectId(),
				room_string: room_string,
				users: room_users
			});

			newRoom.save(function (error, newRoom) {
				if (error){
					// return error
					my_logger('error', error, 'error', 'create_namespace_if_not_exists', 0)
					// res.status(501).json({ success: false, msg: `couldnt save new room for message, and the eror is  => ${error}` });
					return error
				}
			})

			required_room = newRoom
		}

		return required_room
	})
	.catch((err) => {
		console.log(err)
	});			

	return required_room	
}

function find_user(phone_number){
	User.findOne({ user_phone_number: phone_number })
	.then((user) => {


		if (user) {

			return user

		} else {

			return 'NO USER FOUND'

		}

	})
	.catch((err) => {
		console.log(err)
	});			
}

function get_all_rooms_joined_by_user(phone_number){
	User.findOne({ user_phone_number: phone_number })
	.then((user) => {
		let rooms = []
		let room_strings = []
		if (user) {

			rooms = user.rooms
			rooms.map((room) => {
				room_strings.push( room.room_string )
			})
			return room_strings

		} else {

			return 'NO USER FOUND'

		}

	})
	.catch((err) => {
		console.log(err)
	});				
}

function get_room_members(room_string){
	Room.findOne({ room_string: room_string })
	.then((room) => {

		console.log('-------------room string arg is-------------------')
		console.log(room_string)

		if ( room ) {

			console.log('-------------------room found-------------------')
			console.log(room) // user_phone_number
			let users = room.users

			let user_phone_numbers = []
			users.map((user_detail) => {
				user_phone_numbers.push( user_detail.user_phone_number )
			})

			return user_phone_numbers

		} else {

			console.log('room NOT found')	

			return "There are no such room"
		}
	})
	.catch((err) => {
		console.log(err)
	});		
}


function deliver_offline_messages_of_room(room){
	Message.find({ room_string: room })
	.then((messages) => {


		if ( messages !== [] ) {

			console.log('messages NOT found from deliver_offline_messages_of_room function')	

			return "There are no messages here currently"

		} else {

			console.log('messages found from deliver_offline_messages_of_room function')	
			console.log(messages)
			console.log('')

			return messages
		}

	})
	.catch((err) => {
		console.log(err)
	});	
}




async function create_namespace_if_not_exists(user_phone_number, user_name
	// , display_picture
					){

	my_logger(null, null, 'function_entering', 'create_namespace_if_not_exists', 0)

	try{

		return User.findOne({ user_phone_number: user_phone_number })
		.then((user) => {

			if ( !user ) {
				// create room
				const newUser = new User({

					_id: new mongoose.Types.ObjectId(),
					user_phone_number: user_phone_number,
					user_name: user_name,
					// display_picture: display_picture,
				});

				newUser.save(function (error, newRoom) {
					if (error){
						// return error
						my_logger('error', error, 'error', 'create_namespace_if_not_exists', 0)
						// res.status(501).json({ success: false, msg: `couldnt save new room for message, and the eror is  => ${error}` });
						return error
					}
				})

				my_logger('newUser', newUser, 'function_returning', 'create_namespace_if_not_exists', 0)
				// res.status(200).json( newUser )
				return newUser

			} else {

				my_logger('user', user, 'function_returning', 'create_namespace_if_not_exists', 0)
				// res.status(200).json( user )
				return user
			}
		})


	} catch (err) {

		my_logger('err', err, 'error', 'create_namespace_if_not_exists', 0)

	}

	my_logger(null, null, 'function_exiting', 'create_namespace_if_not_exists', 0)
	
}

// {user_phone_number: user_phone_number, user_name: user_name, display_picture: display_picture}
async function create_room_if_not_exists(user_details_list){

	my_logger(null, null, 'function_entering', 'create_room_if_not_exists', 0)

	try{

		let phone_numbers = []
		let namespace_objects = []
		let room_object = {}
	// creating namespace for alll
	// getting phone numbers in a list for chosing namespace number later

		for (let i = 0; i < user_details_list.length; i++) {

			let user_detail_object = user_details_list[i]
			// let number1_pattern = /\d+(?=\-)/
			// let number1 = user_detail_object.user_phone_number.match( number1_pattern )
			phone_numbers.push( user_detail_object.user_phone_number )
			
			var namespace_object = await create_namespace_if_not_exists( user_detail_object.user_phone_number, user_detail_object.user_name )

			my_logger('create_namespace_if_not_exists', {arg_passed:'namespace_object', arg:JSON.stringify(namespace_object)}, 'alert', 'create_room_if_not_exists', 1)

			namespace_objects.push( namespace_object )
			// let number2_pattern = /\d+(?=\+)/
			// let number2 = room_string.match( number2_pattern )
		
		} 

		my_logger('namespace_objects', namespace_objects, 'value', 'create_room_if_not_exists', 0)

		phone_numbers = phone_numbers.sort(function sortByDay(a, b) {
			return Number(a) - Number(b);
		});

		let number_for_namespace = phone_numbers[0]

		let user_object_for_namespace = phone_numbers.filter(
			function(item){
				return item.user_phone_number === number_for_namespace
			}
		)
		// let namespace_number = ( Number(number1) < Number(number2) ) ? number1 : number2
		// let _room_string = ( Number(number1) < Number(number2) ) ? `${number1}-${number2}` : `${number2}-${number1}`

		// await namespace_object = create_namespace_if_not_exists(namespace_number)

		let room_string = `${number_for_namespace}-${phone_numbers[1]}+`

		// let namespace_object1 = await create_namespace_if_not_exists(number1)
		// let namespace_object2 = await create_namespace_if_not_exists(number2)

		// let namespace_object_to_user = ( Number(number1) < Number(number2) ) ? namespace_object1 : namespace_object2

		return Room.findOne({ room_string: room_string })
		.then((room) => {

			if (!room) {
				// create room
				const newRoom = new Room({

					_id: new mongoose.Types.ObjectId(),
					room_string: room_string,
					// namespace: namespace_objects,
					// users: user_object_for_namespace,

				});

				newRoom.save(function (error, newRoom) {
					if (error){
						newRoom.namespace = namespace_objects
						newRoom.users = user_object_for_namespace
						// res.status(501).json({ success: false, msg: "couldnt save new room for message" });
						my_logger('error', error, 'error', 'create_room_if_not_exists', 0)
						return error;
					}
				})

				room_object = newRoom
			
			} else {
			
				room_object = room
			
			}

			my_logger('room_object', room_object, 'function_returning', 'create_room_if_not_exists', 0)
			return room_object
			
		})

	} catch (err) {

		my_logger('err', err, 'error', 'create_room_if_not_exists', 0)

	}

	my_logger(null, null, 'function_exiting', 'create_room_if_not_exists', 0)
	
}


// function assign_socket_to_room_if_exists_or_create_it(room, socket){

// 	my_logger(null, null, 'function_entering', 'assign_socket_to_room_if_exists_or_create_it', 0)

// 	try{

// 		Room.findOne( { room_string: room } )
// 		.then((room_object) => {
// 			if (room_object === null) {
// 				const newRoom = new Room({
// 					_id: new mongoose.Types.ObjectId(),
// 					room_string: room,
// 				});      

// 				console.log('room_object NOT found from assign_socket_to_room_if_exists_or_create_it function')	

// 				newRoom.save(function (err, newRoom) {
					
// 					my_logger( 'socker.id', socker.id, 'value', 'assign_socket_to_room_if_exists_or_create_it' , 0)
// 					// console.log('socket.id is', socket.id)
														
// 					my_logger( 'newRoom', newRoom, 'value', 'assign_socket_to_room_if_exists_or_create_it' ), 0	
// 					// console.log(newRoom)

// 					if (err) {
// 						my_logger( 'err', err, 'error', 'assign_socket_to_room_if_exists_or_create_it' , 0)
// 						return err
// 					}

// 					newRoom.save();
// 				});

// 				my_logger( 'newRoom', newRoom, 'value', 'assign_socket_to_room_if_exists_or_create_it' , 0)
// 				// console.log(newRoom)

// 			} else {

// 				my_logger( 'room_object', room_object, 'value', 'assign_socket_to_room_if_exists_or_create_it' , 0)
// 				// console.log(room_object)

// 				room_object.save(function (err1, room_object) {
// 					if (err1) {
// 						my_logger( 'err1', err1, 'error', 'assign_socket_to_room_if_exists_or_create_it' , 0)
// 						return err1	
// 					}
// 				});
// 			}

// 		})
// 		.catch((err2) => {
// 			my_logger( 'err2', err2, 'error', 'assign_socket_to_room_if_exists_or_create_it' , 0)
// 		});		

// 		// my_logger('returned_value', returned_value, 'function_returning', 'assign_socket_to_room_if_exists_or_create_it', 0)
// 		// return 

// 	} catch (err) {

// 		my_logger('err', err, 'error', 'assign_socket_to_room_if_exists_or_create_it', 0)

// 	}

// 	my_logger(null, null, 'function_exiting', 'assign_socket_to_room_if_exists_or_create_it', 0)
	
// }















// function assign_room_to_messages_if_exists(room){
// 	Message.find({ room_string: room })
// 	.then((messages) => {


// 		if (messages = []) {

// 			console.log('messages NOT found from assign_room_to_messages_if_exists function')	

// 		} else {

// 			console.log('messages found from assign_room_to_messages_if_exists function')	
// 			console.log(messages)
// 			console.log('')

// 			messages.map((message)=>{
// 				message.room = room 
// 				message.save(function (err, message) {
// 					if (err) return console.log(err);
// 				});
// 			})
// 		}

// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});
// }

// function calculate_peer_count(room){
// 	Room.findOne( {room_string: room} )
// 	.then((room) => {


// 		if (room === null) {

// 			console.log('room NOT found from calculate_peer_count function')	

// 			return 0 
// 		} else {

// 			console.log('room found from calculate_peer_count function')	
// 			console.log(room)
// 			console.log('')

// 			return room.sockets.length
// 		}

// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});

// }

// function send_joined_peers_data_to_all_sockets(room){
// 	Room.find( {room_string: room} )
// 	.then((rooms) => {


// 		if (rooms = []) {
	
// 			console.log('rooms NOT found from send_joined_peers_data_to_all_sockets function')	

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('rooms found from send_joined_peers_data_to_all_sockets function')	
// 			console.log(rooms)
// 			console.log('')

// 			// rooms.map((room)=>{
// 			// 	room.socket.emit('joined-peers', {
// 		 //          // number of objects in 'rooms db'
// 		 //          // Databasified
// 		 //          // peerCount: rooms[room].size, //connectedPeers.size,
// 		 //          peerCount: calculate_peer_count(room),
// 		 //        })
				
// 			// })
// 		}

// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});
// }

// function send_disconnected_peer_data_to_all_sockets(room){
// 	Room.find( {room_string: room} )
// 	.then((rooms) => {


// 		if (rooms = []) {

// 			console.log('rooms NOT found from send_disconnected_peer_data_to_all_sockets function')	

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('rooms found from send_disconnected_peer_data_to_all_sockets function')	
// 			console.log(rooms)
// 			console.log('')

// 			// rooms.map((room)=>{
// 			// 	room.socket.emit('peer-disconnected', {
// 		 //          // number of objects in 'rooms db'
// 		 //          // Databasified
// 		 //          // peerCount: rooms[room].size, //connectedPeers.size,
// 		 //          peerCount: calculate_peer_count(room),
// 		 //          socketID: room.socket_id,
// 		 //        })
				
// 			// })
// 		}

// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});
// }




// function save_new_message_from_socket_to_db(room, data){
// 	Room.findOne( {room_string: room} )
// 	.then((room_object) => {


// 		if (room_object === null) {

// 			console.log('room_object NOT found from save_new_message_from_socket_to_db function')	

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('room_object found from save_new_message_from_socket_to_db function')	
// 			console.log(room_object)
// 			console.log('')

// 			const newMessage = new Message({
// 				_id: new mongoose.Types.ObjectId(),
// 				sent_time: data.sent_time,
// 				text: data.text,
// 				room: room,
// 				sender_username: data.sender_username,
// 			});      

// 			newMessage.save(function (err, newRoom) {
// 				if (err) return console.log(err);
// 			});
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});
// }

// function delete_socket_from_room(socket, room){
// 	Room.findOne( {room_string: room} )
// 	.then((room_object) => {


// 		if (room_object === null) {

// 			console.log('room_object NOT found from delete_socket_from_room function')	

// 			return 'Sorry no such room'
// 		} else {

// 			console.log('room_object found from delete_socket_from_room function')	
// 			console.log(room_object)
// 			console.log('')

// 			room_object.sockets.filter( (item) => item !== socket )

// 			room_object.save(function (err, newRoom) {
// 				if (err) return console.log(err);
// 			});
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});	
// }

// function delete_socket_from_room_using_socket_id(socket_id, room){
// 	Room.findOne( {room_string: room} )
// 	.then((room_object) => {


// 		if (room_object === null) {

// 			console.log('room_object NOT found from delete_socket_from_room_using_socket_id function')	

// 			return 'Sorry no such room'
// 		} else {

// 			console.log('room_object found from delete_socket_from_room_using_socket_id function')	
// 			console.log(room_object)
// 			console.log('')

// 			room_object.sockets.filter( (item) => item.id !== socket_id )

// 			room_object.save(function (err, newRoom) {
// 				if (err) return console.log(err);
// 			});
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});	
// }


// function calculate_sockets_in_a_room(room){
// 	Room.findOne( {room_string: room} )
// 	.then((room_object) => {


// 		if (room_object === null) {

// 			console.log('room_object NOT found from calculate_sockets_in_a_room function')	

// 			return 'Sorry no such room'
// 		} else {

// 			console.log('room_object found from calculate_sockets_in_a_room function')	
// 			console.log(room_object)
// 			console.log('')

// 			return room_object.sockets.length
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});
// }

// function delete_all_messages_of_room(room){
// 	Room.deleteMany({ room_string: room }, (err) => console.log(err))
// 	.deleteMany({}, ()=>null)
// }

// function delete_all_messages_from_room_if_no_sockets_left(room){
// 	if ( calculate_sockets_in_a_room(room) === 0 ){
// 		delete_all_messages_of_room(room)
// 	}
// }


// function send_some_user_coming_online_message_to_others(room, data){
// 	Room.findOne( {room_string: room} )
// 	.then((room) => {


// 		if (room === null) {
	
// 			console.log('room NOT found from send_some_user_coming_online_message_to_others function')	

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('room found from send_some_user_coming_online_message_to_others function')	
// 			console.log(room)
// 			console.log('')

// 			// room.sockets.map((_socket_id)=>{
// 			// 	if ( _socket_id !== data.socketID.local){
// 			// 		Socket.findOne( {_id: _socket_id} )
// 			// 		.then((_socket) => {
// 			// 			console.log('-----------------LOG------------------')
// 			// 			console.log(_socket)
// 			// 			// console.log('online-peer', data.socketID, _socket.id)
// 			// 			_socket.socket_object.emit('online-peer', _socket.id)
// 			// 		})
// 			// 	}
// 			// })
// 		}

// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});	
// }





// function send_offer_to_all_users_in_room(room, data){
// 	Room.findOne( {room_string: room} )
// 	.then((room) => {


// 		if (room = []) {

// 			console.log('room NOT found from send_offer_to_all_users_in_room function')	

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('room found from send_offer_to_all_users_in_room function')	
// 			console.log(room)
// 			console.log('')

// 			// room.sockets.map((_socket_id)=>{
// 			// 	if ( _socket_id === data.socketID.local){
// 			// 		Socket.findOne( {_id: _socket_id} )
// 			// 		.then((_socket) => {
// 			// 			// console.log('online-peer', data.socketID, _socket.id)
// 			// 			_socket.socket_object.emit('offer', {
// 			// 				sdp: data.payload,
// 			// 				socketID: data.socketID.local
// 			// 			})
// 			// 		})
// 			// 	}
// 			// })
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});	
// }



// function send_answer_to_all_users_in_room(room, data){
// 	Room.findOne( {room_string: room} )


// 	.then((room) => {

// 		if (room === null) {

// 			console.log('room NOT found from send_answer_to_all_users_in_room function')
// 			console.log(room)
// 			console.log('')

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('room found from send_answer_to_all_users_in_room function')	

// 			// room.sockets.map((_socket_id)=>{
// 			// 	if ( _socket_id === data.socketID.local){
// 			// 		Socket.findOne( {_id: _socket_id} )
// 			// 		.then((_socket) => {
// 			// 			// console.log('online-peer', data.socketID, _socket.id)
// 			// 			_socket.socket_object.emit('answer', {
// 			// 				sdp: data.payload,
// 			// 				socketID: data.socketID.local
// 			// 			})
// 			// 		})
// 			// 	}
// 			// })
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});	
// }




// function send_available_candidates_to_all_users_in_room(room, data){
// 	Room.findOne( {room_string: room} )
// 	.then((room) => {


// 		if (room === null) {

// 			console.log('room NOT found from send_available_candidates_to_all_users_in_room function')	

// 			return 'Sorry no room with this socket'
// 		} else {

// 			console.log('room found from send_available_candidates_to_all_users_in_room function')	
// 			console.log(room)
// 			console.log('')

// 			// room.sockets.map((_socket_id)=>{
// 			// 	if ( _socket_id === data.socketID.local){
// 			// 		Socket.findOne( {_id: _socket_id} )
// 			// 		.then((_socket) => {
// 			// 			// console.log('online-peer', data.socketID, _socket.id)
// 			// 			_socket.socket_object.emit('candidate', {
// 			// 				candidate: data.payload,
// 			// 				socketID: data.socketID.local
// 			// 			})
// 			// 		})
// 			// 	}
// 			// })

// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err)
// 	});	
// }




module.exports = {
	create_room_and_add_users,
	find_user,
	get_all_rooms_joined_by_user,
	get_room_members,
	// store_socket_in_db_if_not_in_it,
	create_namespace_if_not_exists,
	create_room_if_not_exists,
	// assign_socket_to_room_if_exists_or_create_it,
	// assign_room_to_messages_if_exists,
	// calculate_peer_count,
	deliver_offline_messages_of_room,
	// send_joined_peers_data_to_all_sockets,
	// send_disconnected_peer_data_to_all_sockets,
	// save_new_message_from_socket_to_db,
	// delete_socket_from_room,
	// delete_socket_from_room_using_socket_id,
	// delete_all_messages_from_room_if_no_sockets_left,
	// send_some_user_coming_online_message_to_others,
	// send_offer_to_all_users_in_room,
	// send_answer_to_all_users_in_room,
	// send_available_candidates_to_all_users_in_room,
	// delete_all_messages_of_room,
}