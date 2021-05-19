const express = require('express');
const mongoose = require('mongoose');
require('./models/room');
require('./models/message');
require('./models/user');
require('dotenv').config();
require('./config/database');

// require('../models/');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');
const User = mongoose.model('User');

const { my_logger } = require('./handy_functions/my_custom_logger')

const {
	get_room_members,
	offline_messages,
	assign_socket_to_room_if_exists_or_create_it,
	assign_room_to_messages_if_exists,
	calculate_peer_count,
	deliver_offline_messages_of_room,
	send_joined_peers_data_to_all_sockets,
	send_disconnected_peer_data_to_all_sockets,
	save_new_message_from_socket_to_db,
	delete_socket_from_room,
	delete_socket_from_room_using_socket_id,
	delete_all_messages_from_room_if_no_sockets_left,
	send_some_user_coming_online_message_to_others,
	send_offer_to_all_users_in_room,
	send_answer_to_all_users_in_room,
	send_available_candidates_to_all_users_in_room,
	delete_all_messages_of_room,
} = require('./handy_functions/database_functions')


function refresh_all_dbs(){

	my_logger(null, null, 'function_entering', 'refresh_all_dbs', 0)

	try{

		Room.deleteMany({}, ()=>null)
		.deleteMany({}, ()=>null)

		Message.deleteMany({}, ()=>null)
		.deleteMany({}, ()=>null)

		User.deleteMany({}, ()=>null)
		.deleteMany({}, ()=>null)
		
		// my_logger('returned_value', returned_value, 'function_returning', 'refresh_all_dbs', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'refresh_all_dbs', 0)

	}

	my_logger(null, null, 'function_exiting', 'refresh_all_dbs', 0)
	
}

refresh_all_dbs()


const app = express()
const port = 8080
const httpServer = require("http").createServer(app);

var io = require('socket.io')
(
	httpServer,
	{
		path: '/io/webrtc' // this is the path for socket io
	}
)


// const io = require("socket.io")(httpServer, options);

// Databasified
const rooms = {}
// const messages = {}

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
// const peers = io.of('/webrtcPeer') // this is the namespace 11111


// const peers = io.of('/dummy-demonstration')


// const namespaces_being_alive = []

let peers_object = {}
let peers_list = new Map()

// function turn_on_namespace(namespace_name){
// // ADDING LIVE NAMESPACE
// 	if ( peers_list.get( `/${namespace_name}` ) === undefined ){
	
// 		peers_object = io.of( `/${namespace_name}` )
// 		peers_list.set( `/${namespace_name}`, peers_object )
	
// 		return peers_object
// 	}
// }

// function assign_namespace_events(peers_object){
// 	peers_object.on('connection', socket => {
// 		console.log('-------------socket connection established-----------------')

// 		// store_socket_in_db_if_not_in_it(socket)

// 		const room = socket.handshake.query.room // "/"
// 		console.log(`-------------socket ${socket.id} and room ${room}-----------------`)
// 		// console.log('LOG::: ROOM IS', room)
// 	// find room , if found then setting key value pair
// 	// OR find room, asssign socket.id, socket, room as object properties in 'rooms db'

// 		// Databasefied
// 		rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)
// 		// messages[room] = messages[room] || [] // TAKE CARE OF THIS
// 		// assign_socket_to_room_if_exists_or_create_it(room, socket)
// 	// I think not needed since not making sense
// 		// assign_room_to_messages_if_exists(room)

// 		// connectedPeers.set(socket.id, socket)
// 	// SENDING USERS OWN SOCKET ID TO HIM
// 		console.log('-------------------EMITTING connection-success------------')
// 		socket.emit('connection-success', {
// 			success: socket.id,
// 			// Databasified
// 			// number of objects in 'rooms db'
// 			// Databasified
// 			peerCount: rooms[room].size,
// 			// peerCount:calculate_peer_count(room),
// 			// messages: messages[room],


// 			// messages:deliver_offline_messages_of_room(room)
// 		})		
// 		console.log('-------------------connection-success EMMITTED------------')

// 		// const broadcast = () => socket.broadcast.emit('joined-peers', {
// 		//   peerCount: connectedPeers.size,
// 		// })
// 		let room_string = ''
// 		socket.on('join-room', data => {
// 			room_string = data.room_string
// 			socket.join( room_string )
// 		})

// 		const broadcast = () => {
// 		// const my_logger = require('./handy_functions/my_custom_logger', 0)
// 			my_logger(null, null, 'function_entering', 'broadcast', 0)
		
// 			// Databasified
// 			const _connectedPeers = rooms[room]

// 			for (const [socketID, _socket] of _connectedPeers.entries()) {
// 			  // if (socketID !== socket.id) {
// 			    _socket.emit('joined-peers', {
// 			      // number of objects in 'rooms db'
// 			      // Databasified
// 			      peerCount: rooms[room].size, //connectedPeers.size,
// 			      // peerCount: calculate_peer_count(room),
// 			    })
// 			  }
// 				// send_joined_peers_data_to_all_sockets(room) // NOT USEFUL 
			
// 			// my_logger('returned_value', returned_value, 'function_returning', 'broadcast', 0)
// 			// return 
		
			
// 		}

// 		broadcast()

// 		// const disconnectedPeer = (socketID) => socket.broadcast.emit('peer-disconnected', {
// 		//   peerCount: connectedPeers.size,
// 		//   socketID: socketID
// 		// })
// 		const disconnectedPeer = (socketID) => {
		
// 			// Databasified
// 			const _connectedPeers = rooms[room]
// 			for (const [_socketID, _socket] of _connectedPeers.entries()) {
// 			    _socket.emit('peer-disconnected', {
// 			      // number of objects in 'rooms db'
// 			      peerCount: rooms[room].size,
// 			      socketID
// 			    })
// 			}
// 			// send_disconnected_peer_data_to_all_sockets(room) // NOT USEFUL
					
// 			// my_logger('returned_value', returned_value, 'function_returning', 'disconnectedPeer', 0)
// 			// return 
// 		}

// 		// socket.on('new-message', (data) => {
// 		// 	console.log('new-message', JSON.parse(data.payload))
// 		// 	// Databasified
// 		// 	// messages[room] = [...messages[room], JSON.parse(data.payload)]
// 		// 	// save_new_message_from_socket_to_db(room, data) // NOT USEFUL
// 		// })


// 		console.log('-------------------new message EMMITTING------------')
// 		socket.on('new-message', (data) => {
		
// 			let required_room = data.message.room_string
// 			console.log('------------------required_room--------------------')
// 			console.log(required_room)

// 			// socket.emit('message', {text:'test message1', room_string: room, senders_details:'server-11111+'})

// 			console.log('x-x-x-x-x-x-x---------NEW MESSAGE IS BELOWx-x-x-x-x-x-x---------')
// 			console.log(data)

// 			// console.log(data.socketID.local)
// 			// Databasified
// 			// messages[room] = [...messages[room], JSON.parse(data.payload)]
// 			// save_new_message_from_socket_to_db(room, data) // NOT USEFUL
// 			const _connectedPeers = rooms[required_room]
// 			for (const [socketID, _socket] of _connectedPeers.entries()) {
// 				// don't send to self
// 				// if (socketID !== data.socketID.local) {
// 					if (socketID !== data.message.socketID.local) {
// 					// console.log('online-peer', data.socketID, socketID)

// 	// temporarily commenting out below line
// 					// _socket.emit('message', data.payload)
// 					_socket.emit('message', data)
// 				}
// 			}				
// 			// send_some_user_coming_online_message_to_others(room, data) // NOT USEFUL

// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_new_message', 0)
// 			// return 
// 		})
// 		console.log('-------------------new message EMMITTED------------')


// 		socket.on('disconnect', () => {
			
// 			my_logger(null, null, 'function_entering', 'socket_on_disconnect', 0)
		
// 			my_logger( 'disconnected', {message: 'disconnected'}, 'value', 'socket_on_disconnect' , 0)
// 			// console.log('disconnected')
// 			// Databasified
// 			const connectedPeers = rooms[room]
// 			connectedPeers.delete(socket.id)
// 			// Databasified
// 			rooms[room].delete(socket.id)
// 			// delete_socket_from_room(socket, room) // NOT USEFUL
// 			// number of objects in 'rooms db'
// 			if ( rooms[room].size === 0 ){
// 				// delete_all_messages_of_room(room)
// 			}
// 			// delete_all_messages_from_room_if_no_sockets_left(room) // NOT USEFUL
// 			// disconnectedPeer(socket.id) // NOT USEFUL PROBABLY
			

// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_disconnect', 0)
// 			// return 
			
// 		})

// 		// ************************************* //
// 		// NOT REQUIRED
// 		// ************************************* //
// 		socket.on('socket-to-disconnect', (socketIDToDisconnect) => {
		
// 			my_logger(null, null, 'function_entering', 'socket_on_socket_to_disconnect', 0)
		
// 			my_logger( 'disconnected', {message: 'disconnected'}, 'value', 'socket_on_socket_to_disconnect' , 0)
// 			// console.log('disconnected')
// 			// Databasifed
// 			// connectedPeers.delete(socket.id)
// 			rooms[room].delete(socketIDToDisconnect)
// 			// delete_socket_from_room_using_socket_id(socketIDToDisconnect, room) // NOT USEFUL
// 			// number of objects in 'rooms db'
// 			// messages[room] = rooms[room].size === 0 ? null : messages[room]
// 			// delete_all_messages_from_room_if_no_sockets_left(room)
// 			// disconnectedPeer(socketIDToDisconnect) // NOT USEFUL
			
// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_socket_to_disconnect', 0)
// 			// return 
			
// 		})

// 		socket.on('onlinePeers', (data) => {
		
// 			my_logger(null, null, 'function_entering', 'socket_on_onlinePeers', 0)

// 			// Databasified
// 			const _connectedPeers = rooms[room]
// 			for (const [socketID, _socket] of _connectedPeers.entries()) {
// 				// don't send to self
// 				if (socketID !== data.socketID.local) {
// 					my_logger( 'data.socketID', data.socketID, 'value', 'socket_on_onlinePeers' , 0)
// 					my_logger( 'socketID', socketID, 'value', 'socket_on_onlinePeers' , 0)
// 					// console.log('online-peer', data.socketID, socketID)
// 					socket.emit('online-peer', socketID)
// 				}
// 			}
// 			// send_some_user_coming_online_message_to_others(room, data) // NOT USEFUL
			
// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_onlinePeers', 0)
// 			// return 
// 		})

// 		socket.on('offer', data => {
		
// 			my_logger(null, null, 'function_entering', 'socket_on_offer', 0)

// 			my_logger( 'data', data, 'value', 'socket_on_offer' , 0)
// 			// console.log(data)
// 			// Databasified
// 			const _connectedPeers = rooms[room]
// 			for (const [socketID, socket] of _connectedPeers.entries()) {
// 				// don't send to self
// 				if (socketID === data.socketID.remote) {
// 					// console.log('Offer', socketID, data.socketID, data.payload.type)
// 					socket.emit('offer', {
// 							sdp: data.payload,
// 							socketID: data.socketID.local
// 						}
// 					)
// 				}
// 			}
// 			// send_offer_to_all_users_in_room(room, data) // NOT USEFUL
			
// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_offer', 0)
// 			// return 
// 		})

// 		socket.on('answer', (data) => {
		
// 			my_logger(null, null, 'function_entering', 'socket_on_answer', 0)

// 			my_logger( 'data', data, 'value', 'socket_on_answer' , 0)
// 			// console.log(data)
// 			// Databasified
// 			const _connectedPeers = rooms[room]
// 			for (const [socketID, socket] of _connectedPeers.entries()) {
// 				if (socketID === data.socketID.remote) {

// 					my_logger( 'socketID', socketID, 'value', 'socket_on_answer' , 0)
// 					my_logger( 'data.socketID', data.socketID, 'value', 'socket_on_answer' , 0)
// 					my_logger( 'data.payload.type', data.payload.type, 'value', 'socket_on_answer' , 0)

// 					// console.log('Answer', socketID, data.socketID, data.payload.type)
// 					socket.emit('answer', {
// 							sdp: data.payload,
// 							socketID: data.socketID.local
// 						}
// 					)
// 				}
// 			}
// 			// send_answer_to_all_users_in_room(room, data) // NOT USEFUL				

// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_answer', 0)
// 			// return 		
// 		})

// 		// socket.on('offerOrAnswer', (data) => {
// 		//   // send to the other peer(s) if any
// 		//   for (const [socketID, socket] of connectedPeers.entries()) {
// 		//     // don't send to self
// 		//     if (socketID !== data.socketID) {
// 		//       console.log(socketID, data.payload.type)
// 		//       socket.emit('offerOrAnswer', data.payload)
// 		//     }
// 		//   }
// 		// })

// 		socket.on('candidate', (data) => {
		
// 			my_logger(null, null, 'function_entering', 'socket_on_candidate', 0)

// 			my_logger( 'data', data, 'value', 'socket_on_candidate' , 0)
// 			// console.log(data)
// 			// Databasified
// 			const _connectedPeers = rooms[room]
// 			// send candidate to the other peer(s) if any
// 			for (const [socketID, socket] of _connectedPeers.entries()) {
// 				if (socketID === data.socketID.remote) {
// 					socket.emit('candidate', {
// 						candidate: data.payload,
// 						socketID: data.socketID.local
// 					})
// 				}
// 			}
// 			// send_available_candidates_to_all_users_in_room(room, data) // NOT USEFUL				

// 			// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_candidate', 0)
// 			// return 
				
// 		})


// 		my_logger(null, null, 'function_exiting', 'peers_on_connection', 0)

// 	})
// }
// keep a reference of all socket connections
// let connectedPeers = new Map()


// app.get('/', (req, res) => res.send('Hello World!!!!!'))
app.use(express.json())
app.use(express.urlencoded({extended: true}));

app.use(require('./routes'));


app.post('/:room', (req, res, next) => {
	// res.sendFile(__dirname + '/build/index.html')
	console.log('REQUEST', req.body)
	res.status(200).json({data: req.body})
})


// const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
// io.listen(server)


// default namespace
// WHEN CONNECTION IS MADE, ADD THE NAMESPACE INTO LIVE NAMESPACE, AND ASSIGN EVENTS


// io.on('connection', socket => {
// 	console.log("----------------------LOG FROM io.on_connection")
// 	const room = socket.handshake.query.room // "/"
// 	console.log(`-------------socket ${socket.id} and room ${room}-----------------`)


// 	let number1_pattern = /\w+(?=\-)/
// 	let number1 = room.match( number1_pattern )

// 	let number2_pattern = /\d+(?=\+)/
// 	let number2 = room.match( number2_pattern )

// 	let namespace = ( number1 < number2 ) ? String(number1) : String(number2)
// // MAKEING NAMESPACE LIVE
// 	let peers_object = turn_on_namespace(namespace)
// 	console.log('------------aplied turn_on_namespace function---------------')
// // ASSIGNING NAMESPACE EVENTS
// 	if (peers_object != undefined){ // will be undefined if it already exists due to turn_on_namespace function
// 		assign_namespace_events(peers_object)
// 		console.log('------------aplied assign_namespace_events function---------------')
// 	}
// })


// COMMENTING OFF SINCE SHIFTED
io.on('connection', socket => {
	console.log(Object.keys(socket))
	console.log({id:socket.id, room:socket._rooms})

	console.log('-------------socket connection established-----------------')

	// store_socket_in_db_if_not_in_it(socket)

	// const room = socket.handshake.query.room // "/"
	const query_rooms = socket.handshake.query.rooms // "/"
	const user_phone_number = socket.handshake.query.phone_number // "/"
	// console.log(`-------------socket ${socket.id} and room ${room}-----------------`)
	// console.log('LOG::: ROOM IS', room)
// find room , if found then setting key value pair
// OR find room, asssign socket.id, socket, room as object properties in 'rooms db'

	// Databasefied
	console.log('--------------------query_rooms---------------------')
	console.log(query_rooms)
	if (query_rooms.length){
		query_rooms.map((room) => {
			// rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)
			rooms[room] = rooms[room] 
				&& rooms[room].set(socket.id, {socket: socket, user_phone_number:user_phone_number}) 
				|| (new Map()).set(socket.id, {socket: socket, user_phone_number: user_phone_number})
		})
	}
	// messages[room] = messages[room] || [] // TAKE CARE OF THIS
	// assign_socket_to_room_if_exists_or_create_it(room, socket)
// I think not needed since not making sense
	// assign_room_to_messages_if_exists(room)

	// connectedPeers.set(socket.id, socket)
	socket.emit('connection-success', {
		success: socket.id,
		// Databasified
		// number of objects in 'rooms db'
		// Databasified
		peerCount: (query_rooms.length) ? rooms[room].size : 0,
		// peerCount:calculate_peer_count(room),
		// messages: messages[room],


		// messages:deliver_offline_messages_of_room(room)
	})		

	socket.on('bring-someone-to-your-room', (data) => {
		let other_persons_number = data.user_phone_number
		let room = data.room_string
		// MAKE HIM JOIN ROOM IF ONLINE (CHECK IF HIS SOCKET IS THERE TO SEE IF ONLINE)
			// find his socket
		let all_socket_details = rooms.entries()
		
		let required_socket_id = {}
		let required_socket = {}

		for ( [socket_id, socket_object_with_number] of rooms.entries() ){
			
			let number = socket_object_with_number.user_phone_number
			
			if ( number = other_persons_number ) {

				required_socket = socket_object_with_number.socket
				required_socket_id = socket_id
			
			}
		}
		// adding other person into room with his socket
		rooms[room] = rooms[room] 
			&& rooms[room].set(required_socket_id, {socket: required_socket, user_phone_number:other_persons_number}) 
			|| (new Map()).set(required_socket_id, {socket: required_socket, user_phone_number: other_persons_number})

		// ADD ROOM TO HIS JOINED ROOMS IF OFFLINE
			// its already being done in handleMessageAddition in save-message
	})

	socket.on('join-room', (data) => {
		let room = data.room_string
		rooms[room] = rooms[room] 
			&& rooms[room].set(socket.id, {socket: socket, user_phone_number:user_phone_number}) 
			|| (new Map()).set(socket.id, {socket: socket, user_phone_number: user_phone_number})
	})


		
	console.log('-------------------EMITTING connection-success------------')

	console.log('-------------------connection-success EMMITTED------------')

	const broadcast = () => {
	// const my_logger = require('./handy_functions/my_custom_logger', 0)
		my_logger(null, null, 'function_entering', 'broadcast', 0)
	
		// Databasified
		if (query_rooms.length){
			const _connectedPeers = rooms[room]

			for (const [socketID, _socket] of _connectedPeers.entries()) {
			  // if (socketID !== socket.id) {
			    _socket.emit('joined-peers', {
			      // number of objects in 'rooms db'
			      // Databasified
			      peerCount: rooms[room].size, //connectedPeers.size,
			      // peerCount: calculate_peer_count(room),
			    })
			}
		}
	}

	broadcast()

	const disconnectedPeer = (socketID) => {	
		// Databasified
		if (query_rooms.length){
			const _connectedPeers = rooms[room]
			for (const [_socketID, socket_and_phone_number] of _connectedPeers.entries()) {
			    socket_and_phone_number.socket.emit('peer-disconnected', {
			      // number of objects in 'rooms db'
			      peerCount: rooms[room].size,
			      socketID
			    })
			}
		}
	}
	

	let online_users = [] // their phonenumbers
	let offline_users = [] // their phonenumbers

	socket.on('new-message', (data) => {
		// socket.emit('message', {text:'test message1', room_string: room, senders_details:'server-11111+'})
		console.log('x-x-x-x-x-x-x---------NEW MESSAGE IS BELOWx-x-x-x-x-x-x---------')
		console.log(data)
	// SENDING TO ONLINE PEERS
		let required_room = data.message.room_string

		rooms[required_room] = rooms[required_room] 
			&& rooms[required_room].set(socket.id, {socket: socket, user_phone_number:user_phone_number}) 
			|| (new Map()).set(socket.id, {socket: socket, user_phone_number: user_phone_number})

		const _connectedPeers = rooms[required_room]
		for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {
			// don't send to self
			if (socketID !== data.message.socketID.local) {
				socket_and_phone_number.socket.emit('message', data.message)
				online_users.push( socket_and_phone_number.phone_number )
			}
		}
	// STORING IN DATABASE OF OFFLINE MESSAGES FOR USERS
		let all_members_of_room = get_room_members(required_room)
		if ( all_members_of_room === "There are no such room" && all_members_of_room != undefined){
			all_members_of_room.map((room_member) => {
				if ( !online_users.includes(room_member) ){
					offline_users.push( room_member )
				}
			})
		}

		let user_object = {}
		offline_users.map((offline_user) => {
			user_object = find_user(offline_user)
			user_object.offline_messages.push( data.message )
		})
	})

	socket.on('disconnect', () => {
		
		// Databasified
		if (rooms.size > 0){

			const connectedPeers = rooms[room]
			connectedPeers.delete(socket.id)
			// Databasified
			rooms[room].delete(socket.id)
			// delete_socket_from_room(socket, room) // NOT USEFUL
			// number of objects in 'rooms db'
			if ( rooms[room].size === 0 ){
				// delete_all_messages_of_room(room)
			}
			// delete_all_messages_from_room_if_no_sockets_left(room) // NOT USEFUL
			// disconnectedPeer(socket.id) // NOT USEFUL PROBABLY

		}
	})

	// ************************************* //
	// NOT REQUIRED
	// ************************************* //
	socket.on('socket-to-disconnect', (socketIDToDisconnect) => {
	
		my_logger(null, null, 'function_entering', 'socket_on_socket_to_disconnect', 0)
	
		my_logger( 'disconnected', {message: 'disconnected'}, 'value', 'socket_on_socket_to_disconnect' , 0)
		// console.log('disconnected')
		// Databasifed
		// connectedPeers.delete(socket.id)
		rooms[room].delete(socketIDToDisconnect)
		// delete_socket_from_room_using_socket_id(socketIDToDisconnect, room) // NOT USEFUL
		// number of objects in 'rooms db'
		// messages[room] = rooms[room].size === 0 ? null : messages[room]
		// delete_all_messages_from_room_if_no_sockets_left(room)
		// disconnectedPeer(socketIDToDisconnect) // NOT USEFUL
		
		// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_socket_to_disconnect', 0)
		// return 
		
	})

	socket.on('onlinePeers', (data) => {
	
		my_logger(null, null, 'function_entering', 'socket_on_onlinePeers', 0)

		// Databasified
		const _connectedPeers = rooms[room]
		for (const [socketID, _socket] of _connectedPeers.entries()) {
			// don't send to self
			if (socketID !== data.socketID.local) {
				my_logger( 'data.socketID', data.socketID, 'value', 'socket_on_onlinePeers' , 0)
				my_logger( 'socketID', socketID, 'value', 'socket_on_onlinePeers' , 0)
				// console.log('online-peer', data.socketID, socketID)
				socket.emit('online-peer', socketID)
			}
		}
		// send_some_user_coming_online_message_to_others(room, data) // NOT USEFUL
		
		// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_onlinePeers', 0)
		// return 
	})

	socket.on('offer', data => {
	
		my_logger(null, null, 'function_entering', 'socket_on_offer', 0)

		my_logger( 'data', data, 'value', 'socket_on_offer' , 0)
		// console.log(data)
		// Databasified
		const _connectedPeers = rooms[room]
		for (const [socketID, socket] of _connectedPeers.entries()) {
			// don't send to self
			if (socketID === data.socketID.remote) {
				// console.log('Offer', socketID, data.socketID, data.payload.type)
				socket.emit('offer', {
						sdp: data.payload,
						socketID: data.socketID.local
					}
				)
			}
		}
		// send_offer_to_all_users_in_room(room, data) // NOT USEFUL
		
		// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_offer', 0)
		// return 
	})

	socket.on('answer', (data) => {
	
		my_logger(null, null, 'function_entering', 'socket_on_answer', 0)

		my_logger( 'data', data, 'value', 'socket_on_answer' , 0)
		// console.log(data)
		// Databasified
		const _connectedPeers = rooms[room]
		for (const [socketID, socket] of _connectedPeers.entries()) {
			if (socketID === data.socketID.remote) {

				my_logger( 'socketID', socketID, 'value', 'socket_on_answer' , 0)
				my_logger( 'data.socketID', data.socketID, 'value', 'socket_on_answer' , 0)
				my_logger( 'data.payload.type', data.payload.type, 'value', 'socket_on_answer' , 0)

				// console.log('Answer', socketID, data.socketID, data.payload.type)
				socket.emit('answer', {
						sdp: data.payload,
						socketID: data.socketID.local
					}
				)
			}
		}
		// send_answer_to_all_users_in_room(room, data) // NOT USEFUL				

		// my_logger('returned_value', returned_value, 'function_returning', 'socket_on_answer', 0)
		// return 		
	})

	// socket.on('offerOrAnswer', (data) => {
	//   // send to the other peer(s) if any
	//   for (const [socketID, socket] of connectedPeers.entries()) {
	//     // don't send to self
	//     if (socketID !== data.socketID) {
	//       console.log(socketID, data.payload.type)
	//       socket.emit('offerOrAnswer', data.payload)
	//     }
	//   }
	// })

	socket.on('candidate', (data) => {
	
		my_logger(null, null, 'function_entering', 'socket_on_candidate', 0)

		my_logger( 'data', data, 'value', 'socket_on_candidate' , 0)
		// console.log(data)
		// Databasified
		const _connectedPeers = rooms[room]
		// send candidate to the other peer(s) if any
		for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {
			if (socketID === data.socketID.remote) {
				socket_and_phone_number.socket.emit('candidate', {
					candidate: data.payload,
					socketID: data.socketID.local
				})
			}
		}

	})


	my_logger(null, null, 'function_exiting', 'peers_on_connection', 0)

})



httpServer.listen(port);