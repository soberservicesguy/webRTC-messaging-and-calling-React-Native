import {
	RTCPeerConnection, // creates peer connection
	RTCIceCandidate, // creates an ice candidate for us
	RTCSessionDescription, // creates a session description
	mediaDevices, // gives our media devices ie cameras/mics

	MediaStream, // not used
	MediaStreamTrack, // not used
	RTCView, // not used
	registerGlobals, // not used
} from 'react-native-webrtc';

import {
	Dimensions,
} from 'react-native';

import io from 'socket.io-client'

import utils from '../utilities'

import AsyncStorage from '@react-native-community/async-storage';

const axios = require('axios');

const {
	setObjectValue,
	getStoredObject,
	mergeToStoredObject,
	getAllKeys,
} = require('./asyncstorage_function')

const { 
	eventEmitter,
	emit_new_message_recieved,
	emit_new_chatnode,
} = require('./events_management')

const { 
	check_connection_status,
} = require('./netinfo_functions')


// url for REST API
const url = utils.baseURL;

const { my_logger } = require('./my_custom_logger')


setSelfUserDetails = (user_details) => {

	console.log('setSelfUserDetails TRIGGERED')

	try{

		// saving namespace in database
		axios.post(url + '/rooms/save-namespace',
			{
			    user_phone_number: user_details.user_phone_number,
			    user_name: user_details.user_name,
		    }
		)
		.then( (response) => {
			var { username_space } = response.data

			// saving in asyncStorage
			setObjectValue('self_user_details', {...user_details, username_space: username_space})
		})
		.catch( (error) => {
			
			my_logger( 'error', error, 'error', 'setSelfUserDetails' , 0)
			
			// console.log(error);
		})
		
		// my_logger('returned_value', returned_value, 'function_returning', 'setSelfUserDetails', 0)
		// return 

	} catch (error) {

		my_logger('error', error, 'error', 'setSelfUserDetails', 0)

	}

	my_logger(null, null, 'function_exiting', 'setSelfUserDetails', 0)
	
}



assign_socket_events = async (socket_object, object) => {

	console.log('-----------------ABOUT TO ASSIGN EVENTS TO SOCKETS-------------')


	// NEW WEBRTC EVENTS
	socket_object.on('connection-success', data => {

		const status = data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : object.state.status


		object.setState(
			prev => {
				return{
					...prev, 
					status: status,
					messages: data.messages
			}},
			// below is promise
			() => {
				console.log(`after state change in connection-success is status:${object.state.status}, messages:${object.state.messages}`)
				// console.log('COMPLETE STATE IS BELOW')
				// console.log(object.state)
			}
		)
	})

	socket_object.on('joined-peers', data => {

		object.setState(
			prev => ({
				...prev, 
				status: data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : 'Waiting for other peers to connect'
			}),
			// below is promise
			() => {
				console.log(`after state change in joined-peers is status:${object.state.status}`)
				// console.log('COMPLETE STATE IS BELOW')
				// console.log(object.state)
			}
		)

	})

	socket_object.on('peer-disconnected', data => {
		// console.log('peer-disconnected', data)

		const remoteStreams = object.state.remoteStreams.filter(stream => stream.id !== data.socketID)

		object.setState(

			prev => {
				const selectedVideo = prev.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null
				return {
					...prev, 
					remoteStreams: remoteStreams,
					// selectedVideo: ...selectedVideo,
					selectedVideo: selectedVideo, // TRYING THIS
					status: data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : 'Waiting for other peers to connect'
				}
			},
			// below is promise
			() => {
				console.log(`after state change in peer-disconnect is status:${object.state.status}, remoteStreams:${object.state.remoteStreams}, selectedVideo:${object.state.selectedVideo}`)
				// console.log('COMPLETE STATE IS BELOW')
				// console.log(object.state)
			}
		)

	})

	// socket_object.on('online-peer-videocall', socketID => {
	socket_object.on('online-peer-videocall', data => {

		debugger

		console.log('connected peers ...', data.socketID)

		startWebrtcOnCallersDeviceAndAssignEventsAndSendOffer(object, data)

	})

	socket_object.on('offer-videocall', data => {

		startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer(object, data)

	})

	socket_object.on('answer-videocall', data => {
		// get remote's peerConnection
		// console.log('object.state.peerConnections IN answer-videocall')
		// console.log(object.state.peerConnections)
		// console.log('data.socketID IN answer-videocall')
		// console.log(data.socketID)
		const pc = object.state.peerConnections[data.socketID]
		// console.log('data.socketID in ANSWER')
		// console.log(data.socketID)
		// console.log('object.state.peerConnections in ANSWER')
		// console.log(object.state.peerConnections)
		// console.log(data.sdp)

		console.log('data.sdp in ANSWER')
		// console.log(data.sdp)

		if (pc){
			console.log('PC AVAILABLE, NOW DOING FINAL PROCESS IN answer-videocall EVENT')
			pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
			.then(()=> console.log('ANSWERED, ENDED'))
			.catch((err)=> console.log(`NOT ANSWERED, ERROR IS ${err}`))

		} else {
			console.log('THERE IS NOT PC DURING answer-videocall EVENT')
		}
	})

	socket_object.on('candidate', (data) => {
		// get remote's peerConnection
		
		// console.log('object.state.peerConnections IN CANDIDATE')
		// console.log(object.state.peerConnections)

		// console.log('data.socketID')
		// console.log(data.socketID)

		const pc = object.state.peerConnections[data.socketID.remote]
		console.log(' ')
		console.log(' ')
		console.log('THIS')
		console.log({candidate: data.candidate})
		console.log(' ')
		console.log(' ')

		if (pc)
			pc.addIceCandidate(new RTCIceCandidate(data.candidate))
	})


	socket_object.on('message', async data => {
		console.log('============TEST MESSAGE RECIEVED==========')
		// console.log('message', data)

		try{
			let emit_message = await emit_new_message_recieved(object, data)
			console.log('------------------==========EMIT SUCCESSFUL==========-----------')
		} catch (err){
			console.log('---------------================ERR FROM EMIT============----------------')
			console.log(err)
		}

		console.log('MESSAGES ARE BELOW')
		// console.log( object.props.messages )

	})
	
}


// NEW
getAvailableRoomMatesForPeerToPeerCall = (object, room_string) => {
	// let all peers know I am joining
	sendToPeer(
		object,
		'onlinePeers-videocall', 
		// payload
		{
			room: room_string
		}, 
		// socketID
		{
			local: object.props.live_socket.id
		}
	)
}


// USABLE
//# SOCKET.IO METHOD
//# THIS WILL BE USED UNTIL RTCPeerConnection IS ESTABLISHED
//# THIS METHOD EMITS EVENT, PAYLOAD TO SERVER, SERVER UTILIZES IT TO SEND TO OTHERS (PEERS)
sendToPeer = (object, messageType, payload, socketID) => {

	// console.log(`sendToPeer TRIGGERED with ${messageType}`)

	try{
		
		if (object.socket){

			object.socket.emit(messageType, {
				socketID,
				payload
			})

		} else {

			object.props.live_socket.emit(messageType, {
				socketID,
				payload
			})

		}

	} catch (err) {

		my_logger('err', err, 'error', 'sendToPeer', 0)


	}

	
}

// NEW
startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer = (object, data) => {

	console.log('NOW APPLYING CALLBACK FOR startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer')


	createPeerConnection(object, 'RECIEVER', data.room, data.socketID, pc => {
	
		getLocalStream(
			object, 
			'RECIEVER',
			data.room, 
		
			() => {
				if (pc){
					console.log('PC AVAIALBEL IN startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer')
				} else {

					console.log('PC NOT AVAIALBEL IN startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer')
				}

				// console.log('object.state.localStream on RECIEVER')
				// console.log(object.state.localStream)

				pc.addStream(object.state.localStream)

				// Send Channel
				const handleSendChannelStatusChange = (event) => {
					console.log('send channel status: ' + object.state.sendChannels[0].readyState)
				}

				const sendChannel = pc.createDataChannel('sendChannel')
				sendChannel.onopen = handleSendChannelStatusChange
				sendChannel.onclose = handleSendChannelStatusChange
				


				object.setState(
					prev => {

						console.log('prev.sendChannels in RECIEVER')
						// console.log(prev.sendChannels)

						if (prev.sendChannels === null || typeof prev.sendChannels === 'undefined'){
							prev.sendChannels = []
						}
						
						return{
							...prev, 
							sendChannels: [...prev.sendChannels, sendChannel]
						}},
					// below is promise
					() => {
						console.log(`after state change in startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer is sendChannels:${object.state.sendChannels}, `)
						// console.log('COMPLETE STATE IS BELOW')
						// console.log(object.state)
					}
				)
				

				// Receive Channels
				const handleReceiveMessage = (event) => {
					const message = JSON.parse(event.data)
					// console.log(message)

					object.setState(
						prev => {
							if (prev.messages === null || typeof prev.messages === 'undefined'){
								prev.messages = []
							}
							return{
								...prev, 
								messages: [...prev.messages, message]
							}},
							// below is promise
							() => {
								console.log(`after state change in handleReceiveMessage at startWebrtcOnRecieversDeviceAndAssignEventsAndSendAnswer is messages:${object.state.messages}, `)
								// console.log('COMPLETE STATE IS BELOW')
								// console.log(object.state)
							}
					)

				}

				const handleReceiveChannelStatusChange = (event) => {
					if (object.receiveChannel) {
						console.log("receive channel's status has changed to " + object.receiveChannel.readyState);
					}
				}

				const receiveChannelCallback = (event) => {
					const receiveChannel = event.channel
					receiveChannel.onmessage = handleReceiveMessage
					receiveChannel.onopen = handleReceiveChannelStatusChange
					receiveChannel.onclose = handleReceiveChannelStatusChange
				}

				pc.ondatachannel = receiveChannelCallback
			debugger
				pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
					// 2. Create Answer
					pc.createAnswer(object.state.sdpConstraints)
						.then(sdp => {
							pc.setLocalDescription(sdp)

							sendToPeer(
								object,
								'answer-videocall', 
								// payload
								{
									sdp: sdp,
									room: data.room,
								},
								// socketID
								{
									local: object.props.live_socket.id,
									remote: data.socketID
								}
							)
							console.log('answer-videocall SENT')
							console.log({local: object.props.live_socket.id, remote: data.socketID})
						})
				})
			}
		)

	})
}

// NEW
startWebrtcOnCallersDeviceAndAssignEventsAndSendOffer = (object, data) => {

	// create and send offer to the peer (data.socketID)
	// 1. Create new pc

	console.log('NOW APPLYING CALLBACK FOR startWebrtcOnCallersDeviceAndAssignEventsAndSendOffer')

	console.log('ARGS ARE BELOW')
	console.log(`room:${data.room} socketID:${data.socketID}`)

	createPeerConnection(object, 'CALLER', data.room, data.socketID, pc => {
		// 2. Create Offer
		if (pc) {
	
			console.log('DONE 11')
			// Send Channel
			const handleSendChannelStatusChange = (event) => {
				console.log('send channel status: ' + object.state.sendChannels[0].readyState)
			}
			console.log('DONE 12')

			const sendChannel = pc.createDataChannel('sendChannel')
			sendChannel.onopen = handleSendChannelStatusChange
			sendChannel.onclose = handleSendChannelStatusChange
		
			console.log('DONE 13')

			object.setState(
				prev => {

					console.log('prev.sendChannels on CALLER')
					console.log(prev.sendChannels)

					if (typeof prev.sendChannels === 'undefined'){
						prev.sendChannels = []
					}

					return{
						...prev, 
						sendChannels: [...prev.sendChannels, sendChannel]
					}
				},
				// below is promise
				() => {
					console.log(`after state change in startWebrtcOnCallersDeviceAndAssignEventsAndSendOffer is sendChannels:${object.state.sendChannels}, `)
					// console.log('COMPLETE STATE IS BELOW')
					// console.log(object.state)
				}
			)


			console.log('DONE 14')
			// Receive Channels
			const handleReceiveMessage = (event) => {
				const message = JSON.parse(event.data)
				// console.log(message)

				object.setState(
					prev => {
						if (prev.messages === null || typeof prev.messages === 'undefined'){
							prev.messages = []
						}
						return{
							...prev, 
							messages: [...prev.messages, message]
						}},
					// below is promise
					() => {
						console.log(`after state change in at handleReceiveMessage in startWebrtcOnCallersDeviceAndAssignEventsAndSendOffer is messages:${object.state.messages}, `)
						// console.log('COMPLETE STATE IS BELOW')
						// console.log(object.state)
					}
				)

			}

			console.log('DONE 15')

			const handleReceiveChannelStatusChange = (event) => {
				if (object.receiveChannel) {
					console.log("receive channel's status has changed to " + object.receiveChannel.readyState);
				}
			}

			console.log('DONE 16')
			const receiveChannelCallback = (event) => {
				const receiveChannel = event.channel
				receiveChannel.onmessage = handleReceiveMessage
				receiveChannel.onopen = handleReceiveChannelStatusChange
				receiveChannel.onclose = handleReceiveChannelStatusChange
			}

			console.log('DONE 17')
			pc.ondatachannel = receiveChannelCallback

			console.log('DONE 18')

			pc.createOffer(object.state.sdpConstraints)
				.then(sdp => {
				
					console.log('DONE 19')
					pc.setLocalDescription(sdp)

					console.log('DONE 20')
					console.log({remote: data.socketID, local: object.props.live_socket.id,})
					sendToPeer(
						object,
						'offer-videocall', 
			
						// payload
						{
							sdp:sdp,
							room: data.room
						}, 
						// socketID
						{
							local: object.props.live_socket.id,
							remote: data.socketID,
						}
					)
					console.log('DONE 20')
				})
				.catch((err) => {
					console.log('ERROR CAUGHT WHILE CREATING OFFER IN online-peer-videocall EVENT')
					console.log(err)
				})
		}
	})

}







//# SOCKET.IO METHOD
//# MAKING SERVER TO TELL PEOPLE (PEERS) ABOUT PEOPLE THAT WHO ARE ONLINE
whoisOnline = (object, room_string) => {

	console.log('whoisOnline TRIGGERED')

	my_logger(null, null, 'function_entering', 'whoisOnline', 0)

	try{

		console.log('sendToPeer triggered in whoisOnline')
		
		sendToPeer(
			object, 
			'onlinePeers', 
			// payload
			null, 
			// socketID
			{
				local: object.props.live_socket.id, 
				room:room_string
			}
		)

		// my_logger('returned_value', returned_value, 'function_returning', 'whoisOnline', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'whoisOnline', 0)

	}

	my_logger(null, null, 'function_exiting', 'whoisOnline', 0)
	
}



getLocalVoiceStream = (object) => {

	console.log('getLocalVoiceStream TRIGGERED')

	my_logger(null, null, 'function_entering', 'getLocalVoiceStream', 0)

	try{

		const success = (stream) => {
			console.log('localStream... ', stream.toURL())
			// reduxified below
			// object.setState({
			// 	localStream: stream // state
			// })
			object.props.set_localstream( stream )

			whoisOnline(object, room_string)
		}

		const failure = (e) => {
			console.log('getUserMedia Error: ', e)
		}

		let isFront = true;
		mediaDevices.enumerateDevices().then(sourceInfos => {
			console.log(sourceInfos);
			let audioSourceId;
			for (let i = 0; i < sourceInfos.length; i++) {
				const sourceInfo = sourceInfos[i];
				if (sourceInfo.kind == "audioinput"){
					audioSourceId = sourceInfo.deviceId;
				}
			}

			const constraints = {
				audio: true,
				video: false,
			}

			mediaDevices.getUserMedia(constraints)
			.then(success)
			.catch(failure);
		});
		

		// my_logger('returned_value', returned_value, 'function_returning', 'getLocalVoiceStream', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'getLocalVoiceStream', 0)

	}

	my_logger(null, null, 'function_exiting', 'getLocalVoiceStream', 0)
	
}


// NEW
createPeerConnection = (object, source, room_string, socketID, callback) => {

	try {

		console.log('ARGS ARE BELOW')
		console.log(`room_string:${room_string}, socketID:${socketID} for source:${source}`)

		let pc = new RTCPeerConnection(object.props.pc_config)
		if (pc){
			console.log(`PC CREATED AT ${source}`)
		}

		console.log('DONE1')

		// add pc to peerConnections object



		object.setState(
			prev => {

				console.log(`prev.peerConnections in createPeerConnection at ${source}`)
				console.log(prev.peerConnections)

				if (prev.peerConnections === null || typeof prev.peerConnections === 'undefined'){
					prev.peerConnections = {}
				}

				return{
					...prev, 
					peerConnections:{ ...prev.peerConnections, [socketID]: pc },
				}},
			// below is promise
			() => {
				console.log(`after state change in at ${source} in peerConnections is peerConnections:${object.state.peerConnections}, `)
				console.log('COMPLETE STATE IS BELOW')
				console.log(object.state)
			}
		)
	

		console.log('DONE2')

		pc.onicecandidate = (e) => {
			if (e.candidate) {
				sendToPeer(
					object,
					'candidate', 
					// payload
					{
						candidate:e.candidate,
						room: room_string,
					},
					// socketID
					{
						local: object.props.live_socket.id,
						remote: socketID,
					}
				)
				console.log({local: object.props.live_socket.id, remote: socketID,})
			}
		}

		console.log('DONE3')

		pc.oniceconnectionstatechange = (e) => {
			// if (pc.iceConnectionState === 'disconnected') {
			//   const remoteStreams = object.state.remoteStreams.filter(stream => stream.id !== socketID)

			//   object.setState({
			//     remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
			//   })
			// }
		}

		console.log('DONE4')

		pc.onaddstream = (e) => {
			debugger

			// if (e.stream.getTracks().length === 2) alert(e.stream.getTracks()[0].kind)

			// let swappedStream = new MediaStream()
			// console.log('0...', swappedStream)
			// e.stream.getAudioTracks() && swappedStream.addTrack(e.stream.getAudioTracks()[0])
			// console.log('1...', swappedStream)
			// e.stream.getVideoTracks() && swappedStream.addTrack(e.stream.getVideoTracks()[0])
			// console.log('2...', swappedStream)

			// 1. check if stream already exists in remoteStreams
			// const rVideos = object.state.remoteStreams.filter(stream => stream.id === socketID)
			
			// 2. if it does exist then add track
			// if (rVideos.length) {
			//   _remoteStream = rVideos[0].stream
			//   _remoteStream.addTrack(e.track, _remoteStream)
			//   remoteVideo = {
			//     ...rVideos[0],
			//     stream: _remoteStream,
			//   }
			//   remoteStreams = object.state.remoteStreams.map(_remoteVideo => {
			//     return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
			//   })
			// } else {
			//   // 3. if not, then create new stream and add track
			//   _remoteStream = new MediaStream()
			//   _remoteStream.addTrack(e.track, _remoteStream)

			//   remoteVideo = {
			//     id: socketID,
			//     name: socketID,
			//     stream: _remoteStream,
			//   }
			//   remoteStreams = [...object.state.remoteStreams, remoteVideo]
			// }

		
			console.log('DONE5')

			// const remoteVideo = {
			//   id: socketID,
			//   name: socketID,
			//   stream: e.streams[0]
			// }
			object.setState(prevState => {

				let remoteVideo = {}

				remoteVideo = {
					id: socketID,
					name: socketID,
					stream: e.stream,
				}

				// get currently selected video
				if (prevState.remoteStreams === null || typeof prevState.remoteStreams === 'undefined'){
					prevState.remoteStreams = []
				}
				let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
				// if the video is still in the list, then do nothing, otherwise set to new video stream
				selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }

				console.log('selectedVideo')
				console.log(selectedVideo)

				console.log('prevState.remoteStreams')
				console.log(prevState.remoteStreams)


				return {
					...prevState,
					// selectedVideo: remoteVideo,
					selectedVideo: selectedVideo,
					// remoteStream: e.streams[0],
					remoteStream: prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.stream },
					remoteStreams: [...prevState.remoteStreams, remoteVideo]
				}},
				// below is promise
				() => {
					console.log(`after state change in at in onaddstream ${source} in peerConnections is selectedVideo:${object.state.selectedVideo}, remoteStream:${object.state.remoteStream}, remoteStreams:${object.state.remoteStreams}`)
					// console.log('COMPLETE STATE IS BELOW')
					// console.log(object.state)
				}
			)

			console.log('DONE6')
		}

		console.log('DONE7')

		pc.close = () => {
			// alert('GONE')
		}

		console.log('DONE8')

		if (object.state.localStream) {
			pc.addStream(object.state.localStream)

		//   // object.state.localStream.getTracks().forEach(track => {
		//   //   pc.addTrack(track, object.state.localStream)
		//   // })
		}

		console.log('DONE9')
		// return pc
		callback(pc)

		console.log('DONE10')

	} catch(e) {
		console.log(`Something went wrong! pc not created!! AT ${source}`, e)
		// return;
		callback(null)
	}
}



// NEW
switchVideo = (object, _video) => {
	debugger
	// alert(_video)
	object.setState(
		prev => (
			{
				...prev, 
				selectedVideo: _video
		}
	))

}

// OLD
//# FUNCTION THAT SWITCHES VIDEO TO SELECTED ONE
// switchVideo = (object, video) => {

// 	console.log('switchVideo TRIGGERED')

// 	my_logger(null, null, 'function_entering', 'switchVideo', 0)

// 	try{

// 		// debugger
// 		// alert(_video)
// 		// reduxified
// 		// object.setState({ // state
// 		// 	selectedVideo: _video
// 		// })
// 		object.props.set_selectedvideo( video )
	
// 		// my_logger('returned_value', returned_value, 'function_returning', 'switchVideo', 0)
// 		// return 

// 	} catch (err) {

// 		my_logger('err', err, 'error', 'switchVideo', 0)


// 	}

// 	my_logger(null, null, 'function_exiting', 'switchVideo', 0)
	
// }

stopTracks = (stream) => {

	console.log('stopTracks TRIGGERED')

	try{

		stream.getTracks().forEach(track => track.stop())
	
	} catch (err) {

		console.log(`Error caught while stopTracks ${err}`)

	}

}




//# FUNCTION CREATED, BUT NOT USED
send_message = (object, message) => {

	console.log('send_message TRIGGERED')

	my_logger(null, null, 'function_entering', 'send_message', 0)

	try{

		// console.log('message in send_message function')
		// console.log(message)
		// console.log('sendToPeer triggered in send_message')
		sendToPeer(
			object, 
			'new-message', 
			// payload
			message, 
			// socketID
			{
				local: object.props.live_socket.id
			}
		)

		// my_logger('returned_value', returned_value, 'function_returning', 'send_message', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'send_message', 0)


	}

	my_logger(null, null, 'function_exiting', 'send_message', 0)
	
}


// show_new_message = (object) =>{
// 	console.log('show_new_message triggered')
// 	object.socket.on('message', data => {
// 		console.log('message', data.payload)
// 		object.props.add_to_messages( data.payload )
// 		console.log('MESSAGES ARE BELOW')
// 		console.log( object.props.messages )
// 	})
// }



// NEW FUNCTIONS START HERE // NEW FUNCTIONS START HERE // NEW FUNCTIONS START HERE 
// NEW FUNCTIONS START HERE // NEW FUNCTIONS START HERE // NEW FUNCTIONS START HERE 

// joinRoom = (object, room) => {


// 	// let namespace_regex_pattern = /\d+(?=\-)/
// 	// let namespace = room.match( namespace_regex_pattern )

// 	// console.log('BEGINING TO TRIGGER SOCKET')
// 	// object.socket = io.connect(
// 	// 	// `${utils.serviceIP}/${namespace}`,
// 	// 	`${utils.serviceIP}/11111`,

// 	// 	{	transports: ["websocket"],
// 	// 		path: '/io/webrtc', // this is path for socket io
// 	// 		query: {
// 	// 			// room: `/${room}`, //'/',
// 	// 			room: `${room}`, //'/',
// 	// 		}
// 	// 	}
// 	// )
	
// 	// console.log('-----------------SOCKET FOUND----------------')
// 	// console.log(object.socket)

// 	// // object.socket = _socket

// 	// console.log(`Room ${room} joined, socket is below`)
	
// 	// console.log(JSON.stringify(object.socket))

// 	// ----------------------------NEW APPROACH--------------------------------
// 	object.socket.emit( 'join-room', {room_string: room} )
// }


// findRoomsForPendingMessages = (user_name) => {
// 	// console.log('LOG => Ready to make requests')
// 	axios.get(url + '/messages/pending',
// 		{
// 		    user_name: user_name,
// 	    }
// 	)
// 	.then( (response) => {
// 		console.log(response.data);
// 	})
// 	.catch( (error) => {
// 		console.log(error);
// 	})
// }


makePhoneCall = (object, socketID, room_string) => {

	console.log('makePhoneCall TRIGGERED')

	// create and send offer to the peer (data.socketID)
	// 1. Create new pc
	createPeerConnection(object, 'CALLER', room_string, socketID, pc => {
		// 2. Create Offer
		if (pc) {
			
			getLocalVoiceStream(object) // SHIFTED FROM connection-success event, commented out there

			// Send Channel
			const handleSendChannelStatusChange = (event) => {
				console.log('send channel status: ' + object.props.sendChannels[0].readyState)
			}

			const sendChannel = pc.createDataChannel('sendChannel')
			sendChannel.onopen = handleSendChannelStatusChange
			sendChannel.onclose = handleSendChannelStatusChange

			// reduxified		
			// object.setState(prevState => { // state
			// 	return {
			// 		sendChannels: [...prevState.sendChannels, sendChannel]
			// 	}
			// })
			object.props.add_to_sendchannels( sendChannel )

			// Receive Channels
			const handleReceiveMessage = (event) => {
				const message = JSON.parse(event.data)
				console.log(message)
				// reduxified
				// object.setState(prevState => { // state
				// 	return {
				// 		messages: [...prevState.messages, message]
				// 	}
				// })
				object.props.add_to_messages( message )
			}

			const handleReceiveChannelStatusChange = (event) => {
				if (object.receiveChannel) {
					console.log("receive channel's status has changed to " + object.receiveChannel.readyState);
				}
			}

			const receiveChannelCallback = (event) => {
				const receiveChannel = event.channel
				receiveChannel.onmessage = handleReceiveMessage
				receiveChannel.onopen = handleReceiveChannelStatusChange
				receiveChannel.onclose = handleReceiveChannelStatusChange
			}

			pc.ondatachannel = receiveChannelCallback

			// CREATED A FUNCTION FOR BELOW AND WILL BE USED WHEN NEEDED
			// create_offer_through_pc(object.state.sdpConstraints, socketID)
			pc.createOffer(object.state.sdpConstraintsForVoiceCall)
			.then(sdp => {
				pc.setLocalDescription(sdp)

				console.log('sendToPeer triggered in createOffer')

				sendToPeer(
					object, 
					'offer', 
					// payload
					{
						sdp: sdp,
						local: object.props.live_socket.id,
						remote: socketID,
						room: room_string
					},
					// socketID
					object.props.live_socket.id,
				)

				console.log('OFFER CREATED AND SENT')

			})
		}
	})
		
}

getLocalStream = (object, source, room_string, callback) => {
	let isFront = true;

	mediaDevices.enumerateDevices().then(sourceInfos => {

		console.log(source)
		console.log(sourceInfos);
		let videoSourceId;
		for (let i = 0; i < sourceInfos.length; i++) {
			const sourceInfo = sourceInfos[i];
			if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
				videoSourceId = sourceInfo.deviceId;
			}
		}

		const constraints = {
			audio: true,
			video: {
				mandatory: {
					minWidth: 500, // Provide your own width, height and frame rate here
					minHeight: 300,
					minFrameRate: 30
				},
				facingMode: (isFront ? "user" : "environment"),
				optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
			}
		}

		mediaDevices.getUserMedia(constraints)
			.then((stream) => {

				console.log('localStream... ', stream.toURL(), source)

				if (object.state.localStream === null || typeof object.state.localStream === 'undefined'){

					object.setState(
						prev => (
							{
								...prev,
								localStream: stream 
							}
						),
					// below will trigger after set state ends
						() => {
							console.log(`localStream SET NOW RUNNING callback at ${source}, localStream:${object.state.localStream}`)
							console.log(`new state after localStream ${object.state}`)
							callback(object, room_string)
						}
					)
				} else {
					console.log(`localStream ALREADY AVAILABLE, RUNNING callback at ${source}`)
					callback(object, room_string)					
				}

				
				// object.setState({
				// 	localStream: stream
				// })

				// getAvailableRoomMatesForPeerToPeerCall(object,a room_string)

			})
			.catch((e) => {
				console.log('getUserMedia Error: ', e)
			});

	});
}

// NEW
makeVideoCall = (object, room_string) => {

	getLocalStream(
		object, 
		'CALLER',
		room_string, 
		() => getAvailableRoomMatesForPeerToPeerCall(object, room_string)
	)

	// let isFront = true;

	// mediaDevices.enumerateDevices().then(sourceInfos => {

	// 	console.log(sourceInfos);
	// 	let videoSourceId;
	// 	for (let i = 0; i < sourceInfos.length; i++) {
	// 		const sourceInfo = sourceInfos[i];
	// 		if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
	// 			videoSourceId = sourceInfo.deviceId;
	// 		}
	// 	}

	// 	const constraints = {
	// 		audio: true,
	// 		video: {
	// 			mandatory: {
	// 				minWidth: 500, // Provide your own width, height and frame rate here
	// 				minHeight: 300,
	// 				minFrameRate: 30
	// 			},
	// 			facingMode: (isFront ? "user" : "environment"),
	// 			optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
	// 		}
	// 	}

	// 	mediaDevices.getUserMedia(constraints)
	// 		.then((stream) => {

	// 			console.log('localStream... ', stream.toURL())

	// 			object.setState({
	// 				localStream: stream
	// 			})

	// 			getAvailableRoomMatesForPeerToPeerCall(object, room_string)

	// 		})
	// 		.catch((e) => {
	// 			console.log('getUserMedia Error: ', e)
	// 		});

	// });
}




goOnline = async (object) => {

	console.log('goOnline TRIGGERED')

	// my_logger(null, null, 'function_entering', 'goOnline', 0)

	// try{

	// // OPENING ALL EXISTING SOCKETS SO THAT MESSAGES CAN BE RECIEVED
	// 	// console.log(object.props.all_socket_rooms)
	// 	my_logger( 'object.props.all_socket_rooms', object.props.all_socket_rooms, 'value', 'goOnline' , 0)

	// 	if ( object.props.all_socket_rooms.keys().length === 0 ){
	// 		object.props.all_socket_rooms.map((_socket) => {
	// 			_socket.open()	
	// 		})
	// 	}

	// // FIND MY MESSAGES WHICH I SENT BEING OFFLINE, SO NOW SENDING THEM IN SOCKETS
	// 	getStoredObject('offline_messages')
	// 	.then((all_messages) => {
	// 		all_messages.map((message) => {
	// 			message = JSON.parse(message)
	// 			sendMessageInSocket(object, message, message.room_name)	
	// 		})
	// 	})

	// //# JOINING ROOMS OUT OF CHAT NODES FIRST MESSAGE FROM SONEONE
	// 	my_logger( 'object.props.own_number', object.props.own_number, 'value', 'goOnline' ), 0	
	// 	// console.log('OWN NUMBER IS BELOW')
	// 	// console.log(object.props.own_number)

	// 	axios.get(url + '/rooms/join-room',
	// 		{
	// 		    params:{user_phone_number: object.props.own_number}
	// 	    }
	// 	)
	// 	.then((response) => {
	// 		// console.log('REPSONSE DATA IS BELOW')
	// 		// const my_logger = require('./handy_functions/my_custom_logger', 0)
			
	// 		my_logger( 'response.data', response.data, 'value', 'goOnline' , 0)
	// 		// console.log(response.data);
			
	// 		 // dont forget to try catch wrap entire function
			
			

	// 		let all_rooms = response.data
	// 		all_rooms.map((single_room) => {
	// 			if ( object.props.all_socket_rooms.keys().length === 0 && !object.props.all_socket_rooms.includes(single_room) ){
	// 				eventEmitter.emit('new_entry_in_socket', object, single_room)
	// 				// object.props.add_to_socket_rooms( joinRoom(object, single_room) )
	// 			}
	// 		})
	// 	})
	// 	.catch((error) => {
	// 		my_logger('error', error, 'error', 'goOnline', 0)
	// 		// console.log(error);
	// 	})
	
	// 	// my_logger('returned_value', returned_value, 'function_returning', 'goOnline', 0)
	// 	// return 

	// -------------------------NEW APPROACH--------------------------------- //

	let chat_nodes = await AsyncStorage.getItem('chatnodes')
	let all_room_strings = []
	if ( chat_nodes != null ){
		chat_nodes.map((chat_node) => {
			room_string = chat_node.room_string
			all_room_strings.push( room_string )
		})

	}

	axios.get(url + '/users/get-rooms', 
		{
			params: {
				phone_number: object.props.own_number
			}
	})
	.then((response) => {
		// console.log('---------------------response.data-------------------');
		// console.log(response.data);

		let all_rooms_of_user = response.data

		if (all_rooms_of_user.length){
			all_rooms_of_user.map((room_string) => {
				!all_room_strings.includes(room_string)
				all_room_strings.push(room_string)
			})
		}

		object.socket = io.connect(
			// `${utils.serviceIP}/${namespace}`,
			// `${utils.serviceIP}/11111`,
			`${utils.baseURL}/`,
			// `${utils.baseURL}/dummy-demonstration`,

			{	
				transports: ["websocket"],
				path: '/io/webrtc', // this is path for socket io
				query: {
					// room: `/${room}`, //'/',
					// room: `${room}`, //'/',			
					rooms: all_room_strings,
					phone_number: object.props.own_number,
				}
			}
		)

		console.log('SETTING SOCKET IN REDUX')
		object.props.set_socket( object.socket )


		assign_socket_events(object.socket, object)
		console.log('--------------------GONE ONLINE, CREATED SOCKET-----------------')
	})
	.catch((error) => {
		console.log(error);
	})
}



goOffline = (object) => {	

	console.log('goOffline TRIGGERED')

	my_logger(null, null, 'function_entering', 'goOffline', 0)

	try{

		// closing all sockets
		object.props.all_socket_rooms.map((_socket) => {
			_socket.close()
		})	
		
	} catch (err) {

		my_logger('err', err, 'error', 'goOffline', 0)


	}

	my_logger(null, null, 'function_exiting', 'goOffline', 0)
	
}


addSomeoneToRoom = (object, user_phone_number, room) => {

	console.log('addSomeoneToRoom TRIGGERED')

	my_logger(null, null, 'function_entering', 'addSomeoneToRoom', 0)

	try{

		axios.post(url + '/rooms/add-to-room', 
			{
				user_phone_number: user_phone_number,
				room: room,
			})
			.then(function (response) {
				console.log(response.data);
			})
			.catch(function (error) {
				console.log(error);
		});
		// socket.close()
		

	} catch (err) {

		my_logger('err', err, 'error', 'addSomeoneToRoom', 0)


	}

	my_logger(null, null, 'function_exiting', 'addSomeoneToRoom', 0)
	
}


leaveRoom = (object, room) => {

	console.log('leaveRoom TRIGGERED')

	my_logger(null, null, 'function_entering', 'leaveRoom', 0)

	try{

		axios.post(url + '/rooms/leave-room', 
			{
				user_name: user_name,
				room: room,
			})
			.then(function (response) {
				
				my_logger( 'response.data', response.data, 'value', 'leaveRoom' )			, 0	
				// console.log(response.data);
			})
			.catch(function (error) {

				my_logger( 'error', error, 'error', 'leaveRoom' , 0)
				// console.log(error);
		});
		

	} catch (err) {

		my_logger('err', err, 'error', 'leaveRoom', 0)

	}

	my_logger(null, null, 'function_exiting', 'leaveRoom', 0)
	
}


removeFromRoom = (object, users_number, room) => {

	console.log('removeFromRoom TRIGGERED')

	my_logger(null, null, 'function_entering', 'removeFromRoom', 0)

	try{

		axios.post(url + '/rooms/remove-from-room', 
			{
				users_number: users_number,
				room: room,
			})
			.then(function (response) {
				
				my_logger( 'response.data', response.data, 'value', 'removeFromRoom' , 0)
								
				// console.log(response.data);
			})
			.catch(function (error) {

				my_logger( 'error', error, 'error', 'removeFromRoom' , 0)
				// console.log(error);
		});	
		

	} catch (err) {

		my_logger('err', err, 'error', 'removeFromRoom', 0)


	}

	my_logger(null, null, 'function_exiting', 'removeFromRoom', 0)
	
}


blockUser = (object, users_number, room) => {

	console.log('blockUser TRIGGERED')

	my_logger(null, null, 'function_entering', 'blockUser', 0)

	try{

		axios.post(url + '/rooms/block-number', 
			{
				users_number: users_number,
				room: room,
			})
			.then(function (response) {
				my_logger( 'response.data', response.data, 'value', 'blockUser' , 0)
				// console.log(response.data);
			})
			.catch(function (error) {
				my_logger( 'error', error, 'error', 'blockUser' , 0)
				console.log(error);
		});
		

	} catch (err) {

		my_logger('err', err, 'error', 'blockUser', 0)

	}

	my_logger(null, null, 'function_exiting', 'blockUser', 0)
	
}

function generate_proper_room_string(room_string){

	let number1_pattern = /\d+(?=\-)/
	let number1 = room_string.match( number1_pattern )

	let number2_pattern = /\d+(?=\+)/
	let number2 = room_string.match( number2_pattern )

	room_string = ( Number(number1) < Number(number2) ) ? `${number1}-${number2}+` : `${number2}-${number1}+`

	return room_string
}

// EACH MESSAGE SHOULD HAVE "SEEN" "DELIVERED" STATE
// will be used in componentDidMount of individual screen
// will be triggered when new message comes, then fed to current_chat_screen_room_string
messageToRelevantChatNodeOnIndividualScreen = async (room_string, object) => {

	console.log('messageToRelevantChatNodeOnIndividualScreen TRIGGERED')

	my_logger(null, null, 'function_entering', 'messageToRelevantChatNodeOnIndividualScreen', 0)

	try{

	// swapping numbers in room string and using both room_strings

		my_logger( 'room_string', room_string, 'value', 'messageToRelevantChatNodeOnIndividualScreen' , 0)
		
		
		room_string = generate_proper_room_string(room_string)

		return AsyncStorage.getItem('stored_messages')
		.then((all_messages) => {
			console.log({all_messages})
			my_logger( 'all_messages', all_messages, 'value', 'messageToRelevantChatNodeOnIndividualScreen' , 0)
			my_logger( 'all_messages.length', all_messages.length, 'value', 'messageToRelevantChatNodeOnIndividualScreen' , 0)

			if ( all_messages.length > 2 ){ // kept 2 because it showed length as 2

				my_logger( 'typeof(all_messages)', typeof(all_messages), 'value', 'messageToRelevantChatNodeOnIndividualScreen' , 0)

				all_messages = JSON.parse( all_messages )

				my_logger( 'typeof(all_messages)', typeof(all_messages), 'value', 'messageToRelevantChatNodeOnIndividualScreen' , 0)
				my_logger( 'all_messages', all_messages, 'value', 'messageToRelevantChatNodeOnIndividualScreen' , 0)

				for (let i = 0; i < all_messages.length; i++) {
					console.log( all_messages[i].room_string )
				} 
				
				// console.log(room_string1)
				// console.log(room_string2)
				// console.log('MATCHED items ARE BELOW')
				all_messages = all_messages.filter(
					function(item){
						// if
						// console.log(item)
						// console.log(item.room_string) 
						if (item.room_string !== room_string){
							// console.log('not matched')
							// console.log(item)
							// console.log(room_string)
						}
						return item.room_string === room_string
					}
				)

				// console.log('FILTERED MESSAGES FOR ROOM ARE BELOW')
				// my_logger( 'all_messages (BUT FILTERED) ', all_messages, 'value', 'messageToRelevantChatNodeOnIndividualScreen' )			, 0	
				// console.log(all_messages)

				// console.log('triggered1')
				all_messages = all_messages.sort(function sortByUnixTime(a, b){
					let time1 = a.sent_time;
					let time2 = b.sent_time;
					return time1 - time2;
				});

				// 3 filter last 20 messages from it
				all_messages = all_messages.slice(-20)
				// 4 add last 20 messages to data for node
			}
			// console.log('RETURNED MESSAGES ARE BELOW')
			// console.log(all_messages)
			my_logger('all_messages', all_messages, 'function_returning', 'messageToRelevantChatNodeOnIndividualScreen', 0)
			return all_messages
		})
		.catch((error) => {

			my_logger( 'error', error, 'error', 'messageToRelevantChatNodeOnIndividualScreen' , 0)

		})


		// return all_messages
		// .then((all_messages) => {
		// 	all_messages = all_messages.filter(
		// 		function(item){
		// 			return item.room_string === room_string1
		// 		}
		// 	)

		// 	all_messages.sort(function sortByUnixTime(a, b){
		// 		let time1 = a.sent_time;
		// 		let time2 = b.sent_time;
		// 		return time1 - time2;
		// 	});

		// 	// 3 filter last 20 messages from it
		// 	all_messages = all_messages.slice(-20)
		// 	// 4 add last 20 messages to data for node
		// 	return all_messages
		// })
		// .catch((err) => console.log('ERRRRRR1', err))		




	} catch (err) {

		my_logger('err', err, 'error', 'messageToRelevantChatNodeOnIndividualScreen', 0)

	}

	my_logger(null, null, 'function_exiting', 'messageToRelevantChatNodeOnIndividualScreen', 0)
	
}

	// assign data as below , if doesnt work assign it to state and give state to below data
	// data = [...all_messages, ...object.props.new_messages_of_current_room]


// EACH MESSAGE SHOULD HAVE "SEEN" "DELIVERED" STATE
// will be used in componentDidMount of all_chat_nodes screen
messageCountAndLastMessageToRelevantChatNode = async (object, room_string) => {

	console.log('messageCountAndLastMessageToRelevantChatNode TRIGGERED')

	// 1 get all messages from asyncstorage
	let all_messages = await getStoredObject('stored_messages')
	// 2 filter on room_string and find node's room_string
	// all_messages = all_messages.filter(
	// 	function(item){
	// 		return item.room_string === room_string
	// 	}
	// )
	// // 3 filter to unseen messages on it and just get the count
	// all_messages = all_messages.filter(
	// 	function(item){
	// 		return item.message_state === 'new'
	// 	}
	// )

	// let new_messages_count = all_messages.length
	// // 4 add last message to data for node
	// let last_message = all_messages.slice(-1)

	// return {count:new_messages_count, last_message:last_message}
	
	return AsyncStorage.getItem('stored_messages')
	.then((all_messages) => {
		// console.log('MESSAGES ARE BELOW')
		// console.log(all_messages)
		// console.log('===================all_messages====================')
		// console.log(all_messages)

		// since its saying all_messages.filter is not a function
		all_messages = [...all_messages]

		if ( all_messages.length && all_messages.length >0 ){
		// 2 filter on room_string and find node's room_string

			all_messages = all_messages.filter(
				function(item){
					return item.room_string === room_string
				}
			)
			// 3 filter to unseen messages on it and just get the count
			all_messages = all_messages.filter(
				function(item){
					return item.message_state === 'new'
				}
			)

			var new_messages_count = all_messages.length
			// 4 add last message to data for node
			var last_message = all_messages.slice(-1)

			my_logger('{count:new_messages_count, last_message:last_message}', {count:new_messages_count, last_message:last_message}, 'function_returning', 'messageCountAndLastMessageToRelevantChatNode', 0)
			
			return {count:new_messages_count, last_message:last_message}
		} else {
			my_logger(`{count:0, last_message:'no messages'}`, {count:0, last_message:'no messages'}, 'function_returning', 'messageCountAndLastMessageToRelevantChatNode', 0)
			return {count:0, last_message:'no messages'}
		}
	})
	.catch((err) => {
		my_logger( 'error', err, 'error', 'messageCountAndLastMessageToRelevantChatNode' , 0)
		console.log('---------------line 1944------------')
		console.log(err)
	})


	
}

module.exports = { 
	setSelfUserDetails,
	whoisOnline,
	sendToPeer,
	createPeerConnection,
	assign_socket_events,
	// joinRoom,
	switchVideo,
	stopTracks,
	goOffline,
	goOnline,
	// show_new_message,
	getLocalStream,
	getLocalVoiceStream,
	makePhoneCall,
	makeVideoCall,
	addSomeoneToRoom,
	leaveRoom,
	removeFromRoom,
	blockUser,
	messageToRelevantChatNodeOnIndividualScreen,
	messageCountAndLastMessageToRelevantChatNode,

	send_message,
	// sendMessageInSocket,

	generate_proper_room_string,
}