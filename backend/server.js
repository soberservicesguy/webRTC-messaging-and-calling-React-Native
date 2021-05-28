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
// const rooms = {}
const rooms = new Map()
// const messages = {}

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
// const peers = io.of('/webrtcPeer') // this is the namespace 11111


// const peers = io.of('/dummy-demonstration')


// const namespaces_being_alive = []

// let peers_object = {}
// all sockets with phone_numbers, without room info
let live_sockets_and_numbers = new Map()


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


function connect_socket_to_room(some_room, all_rooms, live_socket, socket_id, phone_number){

	// if (typeof all_rooms[some_room] !== 'undefined'){

	// 	let existing_socket_id = all_rooms[some_room].get(socket_id)

	// 	if (!existing_socket_id){

	// 		all_rooms[some_room] = all_rooms[some_room] 
	// 			&& all_rooms[some_room].set(socket_id, {socket: live_socket, user_phone_number:phone_number}) 
	// 			|| (new Map()).set(socket_id, {socket: live_socket, user_phone_number: phone_number})

	// 		// console.log('Connected below socket')
	// 		// console.log({id: socket_id, socket:Object.keys(live_socket)})
	// 		// console.log(`FINAL SOCKETS ARE BELOW FOR THIS ROOM ${some_room}`)
	// 		// console.log(all_rooms[some_room].keys())

	// 	} else {
	// 		console.log('SOCKET ALREADY CONNECTED TO THIS ROOM')
	// 	}
	// }

	all_rooms[some_room] = all_rooms[some_room] 
		&& all_rooms[some_room].set(socket_id, {socket: live_socket, user_phone_number:phone_number}) 
		|| (new Map()).set(socket_id, {socket: live_socket, user_phone_number: phone_number})


}

function store_in_live_sockets_along_phone_number(live_sockets_and_numbers_map, phone_number, socket, socket_id){
	live_sockets_and_numbers_map.set(phone_number, {socket_id: socket_id, socket:socket})
	// console.log('Storing below socket')
	// console.log({number: phone_number, socket:Object.keys(socket)})
	console.log('FINAL SOCKETS WITH NUMBERS ARE BELOW')
	console.log(live_sockets_and_numbers_map.keys())
}


// COMMENTING OFF SINCE SHIFTED
io.on('connection', socket => {
	// console.log(Object.keys(socket))

	console.log('-------------socket connection established-----------------')

	// store_socket_in_db_if_not_in_it(socket)

	const query_rooms = socket.handshake.query.rooms // "/"
	const user_phone_number = socket.handshake.query.phone_number // "/"
	store_in_live_sockets_along_phone_number(live_sockets_and_numbers, user_phone_number, socket, socket.id)

	// console.log(`-------------socket ${socket.id} and room ${room}-----------------`)
	// console.log('LOG::: ROOM IS', room)
// find room , if found then setting key value pair
// OR find room, asssign socket.id, socket, room as object properties in 'rooms db'

	// Databasefied
	// adding socket to all joined rooms of some user, obtained from his storage
	if (query_rooms.length){
		query_rooms.map((room) => {
			// rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)

			connect_socket_to_room(room, rooms, socket, socket.id, user_phone_number)

			// rooms[room] = rooms[room] 
			// 	&& rooms[room].set(socket.id, {socket: socket, user_phone_number:user_phone_number}) 
			// 	|| (new Map()).set(socket.id, {socket: socket, user_phone_number: user_phone_number})
		})
	}
	// messages[room] = messages[room] || [] // TAKE CARE OF THIS
	// assign_socket_to_room_if_exists_or_create_it(room, socket)
// I think not needed since not making sense
	// assign_room_to_messages_if_exists(room)


	socket.on('new-message', (data) => {

		console.log('x-x-x-x-x-x-x---------NEW MESSAGE IS BELOWx-x-x-x-x-x-x---------')
	// SENDING TO ONLINE PEERS
		let required_room = data.message.room_string

		// console.log('socket being set in .MAP is below')
		// console.log(socket)

		// connect_socket_to_room(required_room, rooms, socket, socket.id, user_phone_number)

		// rooms[required_room] = rooms[required_room] 
		// 	&& rooms[required_room].set(socket.id, {socket: socket, user_phone_number:user_phone_number}) 
		// 	|| (new Map()).rooms[required_room].set(socket.id, {socket: socket, user_phone_number: user_phone_number})			
	
		const _connectedPeers = rooms[required_room]

		// console.log('_connectedPeers')
		// console.log(_connectedPeers)
		// for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {
		// 	// don't send to self
		// 	if (socketID !== data.message.socketID.local) {
		// 		console.log('socketID')
		// 		console.log(socketID)
		// 		console.log('socket_and_phone_number')
		// 		console.log(socket_and_phone_number)
		// 	}
		// }



		for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {
			console.log('ENTERED IN connected peers entries')
			// don't send to self
			
			// console.log({socketID, other:data.message.socketID.local})
			// console.log('Object.keys(socket_and_phone_number.socket).length')
			// console.log(Object.keys(socket_and_phone_number.socket).length)

			if (socketID !== data.message.socketID.local) {

				// console.log('socket_and_phone_number')
				// console.log(socket_and_phone_number)
				// console.log(socket_and_phone_number.socket)


				if ( Object.keys(socket_and_phone_number.socket).length !== 0 ){				

					socket_and_phone_number.socket.emit('message', data.message)
					console.log('MESSAGE EMITTED')
					online_users.push( socket_and_phone_number.phone_number )
				}
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

		console.log(`DISCONNECT TRIGGERED FOR ${socket.id}`)

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
	
		console.log('onlinePeers TRIGGERED')

		let room = data.socketID.room

		// Databasified
		const _connectedPeers = rooms[room]
		for (const [socketID, _socket] of _connectedPeers.entries()) {
			// don't send to self
			if (socketID !== data.socketID.local) {
				socket.emit('online-peer', socketID)
			}
		}

	})

	socket.on('offer', data => {
	
		console.log('offer TRIGGERED')

		// Databasified
		let room = data.payload.room

		const _connectedPeers = rooms[room]

		for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {
			// don't send to self
			if (socketID !== data.payload.remote) {

				socket_and_phone_number.socket.emit('offer', {
					sdp: data.payload.sdp,
					socketID: data.socketID,
					room_string:room,
				})

				console.log(`OFFER SENT ${socketID}`)
			}
		}
	})

	socket.on('answer', (data) => {
		
		console.log('ANSWER TRIGGERED')

		let room = data.payload.room

		const _connectedPeers = rooms[room]
		for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {

			if (socketID !== data.payload.remote) {

				// console.log('Answer', socketID, data.socketID, data.payload.type)
				socket_and_phone_number.socket.emit('answer', {
					sdp: data.payload.sdp,
					socketID: data.socketID
				})
				console.log(`ANSWER SENT TO ${socketID}`)
			}
		}

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
	
		console.log('CANDIDATE TRIGGERED')

		let room = data.payload.room

		const _connectedPeers = rooms[room]
		// send candidate to the other peer(s) if any
		for (const [socketID, socket_and_phone_number] of _connectedPeers.entries()) {
			if (socketID !== data.socketID) {
				socket_and_phone_number.socket.emit('candidate', {
					candidate: data.payload.candidate,
					socketID: data.socketID
				})
				console.log(`CANDIDATE SENT TO ${socketID}`)
			}
		}

	})

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
		console.log('TRIGGERED bring-someone-to-your-room')


		let other_persons_numbers = data.user_phone_number
		let room = data.room_string
		// join the room yourself
		connect_socket_to_room(room, rooms, socket, socket.id, user_phone_number)

		let required_socket
		let required_socket_id
		let required_socket_and_id

		// mobile app is sending array of numbers (all numbers who have joined a room ie group)
		if (other_persons_numbers.constructor === Array){

			other_persons_numbers.map((other_persons_number) => {
				console.log('CONNECTING OTHER PERSON TO THE ROOM')
				// console.log('other_persons_number')
				// console.log(other_persons_number)
				required_socket_and_id = live_sockets_and_numbers.get(other_persons_number)
				// console.log('required_socket_and_id')
				// console.log(required_socket_and_id)
				required_socket = required_socket_and_id.socket
				required_socket_id = required_socket_and_id.socket_id
				connect_socket_to_room(room, rooms, required_socket, required_socket_id, other_persons_number)				
				required_socket = null
				required_socket_id = null

			})

		} else {

			let other_persons_number = other_persons_numbers
			required_socket_and_id = live_sockets_and_numbers.get(other_persons_number)
			required_socket = required_socket_and_id.socket
			required_socket_id = required_socket_and_id.socket_id
			connect_socket_to_room(room, rooms, required_socket, required_socket_id, other_persons_number)
		
		}
		// for ( [socket_id, socket_object_with_number] of rooms.get(room).entries() ){
			
		// 	let number = socket_object_with_number.user_phone_number
			
		// 	if ( number = other_persons_number ) {

		// 		required_socket = socket_object_with_number.socket
		// 		required_socket_id = socket_id
		// 		// rooms[room] = rooms[room] 
		// 		// 	&& rooms[room].set(required_socket_id, {socket: required_socket, user_phone_number:other_persons_number}) 
		// 		// 	|| (new Map()).set(required_socket_id, {socket: required_socket, user_phone_number: other_persons_number})			
		// 	}
		// }
	})

	socket.on('join-room', (data) => {
		console.log('TRIGGEDED join-room')

		let room = data.room_string
		let other_persons_number = data.other_persons_number

		connect_socket_to_room(room, rooms, socket, socket.id, user_phone_number)

		let other_persons_socket_and_id
		let other_persons_socket_id

		if (other_persons_number.constructor === Array){

			other_persons_number.map((single_number) => {

				// console.log({user_phone_number, single_number})

				other_persons_socket_and_id = live_sockets_and_numbers.get(single_number)
				other_persons_socket = other_persons_socket_and_id.socket
				other_persons_socket_id = other_persons_socket_and_id.socket_id
				connect_socket_to_room(room, rooms, other_persons_socket, other_persons_socket.id, single_number)

			})

		} else {

			other_persons_socket_and_id = live_sockets_and_numbers.get(other_persons_number)
			other_persons_socket = other_persons_socket_and_id.socket
			other_persons_socket_id = other_persons_socket_and_id.socket_id
			connect_socket_to_room(room, rooms, other_persons_socket, other_persons_socket.id, other_persons_number)

		}


		// rooms[room] = rooms[room] 
		// 	&& rooms[room].set(socket.id, {socket: socket, user_phone_number:user_phone_number}) 
		// 	|| (new Map()).set(socket.id, {socket: socket, user_phone_number: user_phone_number})
	})


		
	// console.log('-------------------EMITTING connection-success------------')

	// console.log('-------------------connection-success EMMITTED------------')

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

		console.log(`DISCONNECTED ${socketID}`)

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

})




const PORT = process.env.PORT || port;
httpServer.listen(PORT);
console.log(`listerning on ${PORT}`)
console.log('NEW VERSION LOADED')