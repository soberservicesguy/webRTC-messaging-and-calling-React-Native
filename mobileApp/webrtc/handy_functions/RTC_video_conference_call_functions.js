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

	my_logger(null, null, 'function_entering', 'setSelfUserDetails', 0)

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

	// console.log(socket_object)
	socket_object.on('connection-success', data => {
		console.log('======================= connection-success TRIGGERED ====================')
		// object.getLocalStream() // SHIFTED TO online-peers event
		object.props.set_own_socket_id( data.success )
		// object.props.set_socket( object.socket )

		console.log(data.success)
		let my_socket_id = data.success
		object.props.set_own_socket_id( my_socket_id )

		const status = data.peerCount > 1 ? `Total Connected Peers to room ${object.props.room}: ${data.peerCount}` : object.props.status
		// reduxified
		// object.setState({ // state
		// 	status,
		// 	messages: data.messages
		// })
		object.props.set_status( status )
		object.props.set_messages( (data.messages == null ? [] : data.messages)  )

//# THIS IS WHATS GETTING AND STORING THE INCOMING MESSAGES IN ASYNCSTORAGE AND SHOWS TO FRONTEND
		console.log('x-x-x-x-x-  ASSIGNED ON MESSAGE EVENT -X-X-X-X-X-X')

		socket_object.on('message', async data => {
			console.log('============TEST MESSAGE RECIEVED==========')
			console.log('message', data)

			let emit_message = await emit_new_message_recieved(object, data)
			emit_message
			.then(() => {console.log('------------------==========EMIT SUCCESSFUL==========-----------')})
			.catch((err) => {
				console.log('---------------================ERR FROM EMIT============----------------'
					)
				console.log(err)
			})
			// eventEmitter.emit('new_entry_in_recieved_message', object, data);

		// USING NEW MESSAGE TO UPDATE ALL CHATNODES			



			// object.props.add_to_messages( data )
			// let chatnodes_details = getStoredObject('chatnodes_details')

		// USING NEW MESSAGE TO ADD NEW CHAT NODE
			// getStoredObject('chatnodes')
			// .then((chatnodes_details) => {
			// 	console.log('====================chatnodes_details==================')
			// 	console.log(chatnodes_details)

			// 	if ( !chatnodes_details.includes(data.user_details) ){

			// 		// mergeToStoredObject('chat_nodes', data.user_details)
			// 		eventEmitter.emit('new_entry_in_chatnodes', object, data.user_details);

			// 	}				
			// })
			// WITHOUT ASYNC
			// object.props.all_chatnodes.map((chatnodes_details) => {
			// 	console.log('====================chatnodes_details==================')
			// 	console.log(chatnodes_details)

			// 	if ( !chatnodes_details.includes(data.user_details) ){

			// 		// mergeToStoredObject('chat_nodes', data.user_details)
			// 		eventEmitter.emit('new_entry_in_chatnodes', object, data.user_details);

			// 	}								
			// })

			console.log('MESSAGES ARE BELOW')
			// console.log( object.props.messages )

		})

	})

	socket_object.on('joined-peers', data => {
		// reduxified
		// object.setState({ // state
		// 	status: data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : 'Waiting for other peers to connect'
		// })
		object.props.set_status( data.peerCount > 1 ? `Total Connected Peers to room ${object.props.room}: ${data.peerCount}` : 'Waiting for other peers to connect' )
	})

	socket_object.on('peer-disconnected', data => {
		console.log('peer-disconnected', data)

		const remoteStreams = object.props.remoteStreams.filter(stream => stream.id !== data.socketID)
		
		// reduxified
		// object.setState(prevState => { // state
		// 	// check if disconnected peer is the selected video and if there still connected peers, then select the first
		// 	const selectedVideo = prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null

		// 	return {
		// 		// remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
		// 		remoteStreams,
		// 		...selectedVideo,
		// 		status: data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : 'Waiting for other peers to connect'
		// 	}
		// })
		object.props.set_remotesteams( remoteStreams )
		object.props.set_selectedvideo( selectedVideo )
		object.props.set_status( data.peerCount > 1 ? `Total Connected Peers to room ${object.props.room}: ${data.peerCount}` : 'Waiting for other peers to connect' )
	})

// THIS BLOCK IS WHERE ALL THE ONLINE PEERS ARE BEING SENT createOffer

	//# HERE WE TRYING TO createPeerConnection TO ONLINE COMING PERSON
	//# ALSO HERE WE GETTING LOCAL STREAM, DATA CHANNEL, MEANS WE STARTING PROCESS HERE
	socket_object.on('online-peer', socketID => {
		// debugger
		console.log('connected peers ...', socketID)
		//# REMOVED THE CALL INITIATING PROCESS
		// // create and send offer to the peer (data.socketID)
		// // 1. Create new pc
		// createPeerConnection(object, socketID, pc => {
		// 	// 2. Create Offer
		// 	if (pc) {
				
		// 		object.getLocalStream() // SHIFTED FROM connection-success event, commented out there

		// 		// Send Channel
		// 		const handleSendChannelStatusChange = (event) => {
		// 			console.log('send channel status: ' + object.props.sendChannels[0].readyState)
		// 		}

		// 		const sendChannel = pc.createDataChannel('sendChannel')
		// 		sendChannel.onopen = handleSendChannelStatusChange
		// 		sendChannel.onclose = handleSendChannelStatusChange

		// 		// reduxified		
		// 		// object.setState(prevState => { // state
		// 		// 	return {
		// 		// 		sendChannels: [...prevState.sendChannels, sendChannel]
		// 		// 	}
		// 		// })
		// 		object.props.add_to_sendchannels( sendChannel )

		// 		// Receive Channels
		// 		const handleReceiveMessage = (event) => {
		// 			const message = JSON.parse(event.data)
		// 			console.log(message)
		// 			// reduxified
		// 			// object.setState(prevState => { // state
		// 			// 	return {
		// 			// 		messages: [...prevState.messages, message]
		// 			// 	}
		// 			// })
		// 			object.props.add_to_messages( message )
		// 		}

		// 		const handleReceiveChannelStatusChange = (event) => {
		// 			if (object.receiveChannel) {
		// 				console.log("receive channel's status has changed to " + object.receiveChannel.readyState);
		// 			}
		// 		}

		// 		const receiveChannelCallback = (event) => {
		// 			const receiveChannel = event.channel
		// 			receiveChannel.onmessage = handleReceiveMessage
		// 			receiveChannel.onopen = handleReceiveChannelStatusChange
		// 			receiveChannel.onclose = handleReceiveChannelStatusChange
		// 		}

		// 		pc.ondatachannel = receiveChannelCallback

		// 		// CREATED A FUNCTION FOR BELOW AND WILL BE USED WHEN NEEDED
		// 		// pc.createOffer(object.state.sdpConstraints)
		// 		// .then(sdp => {
		// 		// 	pc.setLocalDescription(sdp)

		// 		// 	console.log('sendToPeer triggered in line 354')

		// 		// 	sendToPeer(object, 'offer', sdp, {
		// 		// 		local: object.props.live_socket.id,
		// 		// 		remote: socketID
		// 		// 	})
		// 		// })
		// 		// create_offer_through_pc(object.state.sdpConstraints, socketID)
		// 	}
		// })
	})

// add_to_peerconnections
	//# THIS IS USED, WHEN CALL INITIATER SENDS US candidate EMIT THROUGH SERVER 
	socket_object.on('candidate', (data) => {

		console.log('CANDIDATE RECIEVED')
		// get remote's peerConnection
		const pc = object.props.peerConnections.get( data.socketID )
		if (pc){
			console.log('FOUND pc OBJECT')
		}

		if (pc)
			pc.addIceCandidate(new RTCIceCandidate(data.candidate))
	})

// THIS BLOCK IS WHERE createAnswer IS DONE WHEN OFFER IS ACHIEVED
	//# HERE WE ARE USING createPeerConnection ON ANYONE OFFERING US
	socket_object.on('offer', data => {

		console.log('OFFER RECIEVED')

		createPeerConnection(object, data.socketID, pc => {
			if (pc) {

				pc.addStream(object.props.localStream)
				console.log('LOCAL STREAM ADDED')

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
					console.log('MESSAGE RECIEVED THROUGH webRTC BELOW')
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
	// debugger
				//# setRemoteDescription IS FOR OTHER PEER FROM WHOM OFFER IS RECEIVED 
				pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
					console.log('SETTING REMOTE DESCRIPTION')
					// 2. Create Answer
					pc.createAnswer(object.state.sdpConstraints)
					.then(sdp => {
						pc.setLocalDescription(sdp)

						console.log('sendToPeer triggered in line 420')

						sendToPeer(object, 'answer', sdp, {
							local: object.props.live_socket.id,
							remote: data.socketID
						})
					})
				})
			}
		})
	})

	//# ON answer JUST setRemoteDescription WILL BE MADE, REST WAS DONE PREVIOUSLY
	socket_object.on('answer', data => {
		console.log('ANSWER RECIEVED')
		// get remote's peerConnection
		// const pc = object.props.peerConnections[ [data.socketID] ]
		const pc = object.props.peerConnections.get( data.socketID )

		// console.log( '-------------data.socketID---------------')
		// console.log ( data.socketID )


		// console.log( '-------------pc---------------')
		// console.log ( pc )


		// console.log( '-------------peerconnections in 464---------------')
		// console.log ( object.props.peerConnections )

		// console.log(data.sdp)
		pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
	})		
// my_logger('returned_value', returned_value, 'function_returning', 'assign_socket_events', 0)
// return 


	my_logger(null, null, 'function_exiting', 'assign_socket_events', 0)
	
}



//# SOCKET.IO METHOD
//# THIS WILL BE USED UNTIL RTCPeerConnection IS ESTABLISHED
//# THIS METHOD EMITS EVENT, PAYLOAD TO SERVER, SERVER UTILIZES IT TO SEND TO OTHERS (PEERS)
sendToPeer = (object, messageType, payload, socketID) => {

	console.log(`sendToPeer TRIGGERED with ${messageType}`)

	my_logger(null, null, 'function_entering', 'sendToPeer', 0)

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

	my_logger(null, null, 'function_exiting', 'sendToPeer', 0)
	
}

//# SOCKET.IO METHOD
//# MAKING SERVER TO TELL PEOPLE (PEERS) ABOUT PEOPLE THAT WHO ARE ONLINE
whoisOnline = (object) => {

	console.log('whoisOnline TRIGGERED')

	my_logger(null, null, 'function_entering', 'whoisOnline', 0)

	try{

		console.log('sendToPeer triggered in whoisOnline')
		
		sendToPeer(object, 'onlinePeers', null, {local: object.props.live_socket.id})

		// my_logger('returned_value', returned_value, 'function_returning', 'whoisOnline', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'whoisOnline', 0)

	}

	my_logger(null, null, 'function_exiting', 'whoisOnline', 0)
	
}

//# GETTING STREAM FROM LOCAL REQUIRED CAMERA
getLocalStream = (object) => {

	console.log('getLocalStream TRIGGERED')

	my_logger(null, null, 'function_entering', 'getLocalStream', 0)

	try{

		const success = (stream) => {
			console.log('localStream... ', stream.toURL())
			// reduxified below
			// object.setState({
			// 	localStream: stream // state
			// })
			object.props.set_localstream( stream )

			whoisOnline(object)
		}

		const failure = (e) => {
			console.log('getUserMedia Error: ', e)
		}

		let isFront = true;
		mediaDevices.enumerateDevices().then(sourceInfos => {
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
			.then(success)
			.catch(failure);
		});

	} catch (err) {

		my_logger('err', err, 'error', 'getLocalStream', 0)


	}

	my_logger(null, null, 'function_exiting', 'getLocalStream', 0)
	
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

			whoisOnline(object)
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


//# socketID IS OF PERSON WE WANT TO CONNECT TO
//# THIS METHOD IS LETTING US CONNECT TO PERSON DIRECTLY
//# CAN NAME IT createRTCPeerConnection
createPeerConnection = (object, socketID, callback) => {

	console.log('createPeerConnection TRIGGERED')

	my_logger(null, null, 'function_entering', 'createPeerConnection', 0)

	try{

		//# PASSING ICE SERVER AS ARG IN BELOW
		//# THIS MEANS WE ARE MAKING OURSELF AVAILABLE FOR RTCPeerConnection
		let pc = new RTCPeerConnection(object.state.pc_config)

		// add pc to peerConnections object
		
		// reduxified
		// const peerConnections = { ...object.state.peerConnections, [socketID]: pc }
		// object.setState({
		// 	peerConnections // state
		// })
		// console.log('---------------object.props.add_to_peerconnections called-----------')
		// console.log([socketID])
		// console.log(pc)

		object.props.add_to_peerconnections( socketID, pc )
		
		// console.log(object.props.peerConnections)

		//# THIS IS TRIGGERED WHEN WE ARE INTERESTED IN BEING CONNECTED (WE BECOME ICE CANDIDATE)
		//# HERE THE SERVER WILL SEND candidate EVENT AND PAYLOAD TO PERSON WITH socketID 
		pc.onicecandidate = (e) => {
			console.log('onicecandidate Triggered')

			if (e.candidate) {

				console.log('SENDING CANDIDATE TO PEER')			
				// console.log('sendToPeer triggered in onicecandidate')
				//# THIS WILL BE ONLY SENT TO PARTICULAR PERSON (PEER)
				sendToPeer(object, 'candidate', e.candidate, {
					local: object.props.live_socket.id,
					remote: socketID
				})
			}
		}

		//# THIS IS TRIGGERED WHEN CONNECTIONSTATE CHANGES WITH CONNECTED PEER
		pc.oniceconnectionstatechange = (e) => {
			// if (pc.iceConnectionState === 'disconnected') {
			//   const remoteStreams = object.state.remoteStreams.filter(stream => stream.id !== socketID)

			//   object.setState({
			//     remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
			//   })
			// }
			console.log(`oniceconnectionstatechange STTAUS CHANGE ${e}`)
		}

		//# WILL BE TRIGGERED IF PEER ADDS STREAM
		pc.onaddstream = (e) => {
			// debugger

			console.log('TRIGGERED ON ADDSTREAM')

			let _remoteStream = null
			let remoteStreams = object.props.remoteStreams

			// console.log('---------------remoteStreams---------------')
			// console.log(remoteStreams)

			let remoteVideo = {}

			// if (e.stream.getTracks().length === 2) alert(e.stream.getTracks()[0].kind)

			// let swappedStream = new MediaStream()
			// console.log('0...', swappedStream)
			// e.stream.getAudioTracks() && swappedStream.addTrack(e.stream.getAudioTracks()[0])
			// console.log('1...', swappedStream)
			// e.stream.getVideoTracks() && swappedStream.addTrack(e.stream.getVideoTracks()[0])
			// console.log('2...', swappedStream)

			// 1. check if stream already exists in remoteStreams
			// const rVideos = object.state.remoteStreams.filter(stream => stream.id === socketID)
			if (e.stream){
				console.log('REMOTE STREAM IS BEING OBTAINED')
			}

			remoteVideo = {
				id: socketID,
				name: socketID,
				stream: e.stream,
			}

			console.log('remoteVideo')
			console.log(remoteVideo)
			// reduxidied
			// remoteStreams = [...object.state.remoteStreams, remoteVideo] // state
			// object.props.add_to_remotestreams( remoteVideo )
			try {
				object.props.add_to_remotestreams( remoteVideo )
				console.log('ADDED VIDEO TO REMOTE STREAMS')
			}
			catch(err) {
				console.log('COULDNT add_to_remotestreams')
				console.log(err)
			}
			finally {
			}
			// object.props.add_to_remotestreams( remoteVideo )

			// console.log('-------------object.props.remoteStreams-------------')
			// console.log(object.props.remoteStreams)

			// console.log('---------------remoteVideo-------------')
			// console.log( remoteVideo )

			// console.log('---------------object.props.add_to_remotestreams-------------')
			// console.log( object.props.add_to_remotestreams )


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



			// const remoteVideo = {
			//   id: socketID,
			//   name: socketID,
			//   stream: e.streams[0]
			// }

			// reduxified
			// object.setState(prevState => {

			// 	// If we already have a stream in display let it stay the same, otherwise use the latest stream
			// 	// const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
			// 	const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.stream } // state

			// 	// get currently selected video
			// 	let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
			// 	// if the video is still in the list, then do nothing, otherwise set to new video stream
			// 	selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo } // state

			// 	return {
			// 		// selectedVideo: remoteVideo,
			// 		...selectedVideo, // state
			// 		// remoteStream: e.streams[0],
			// 		...remoteStream, // state
			// 		remoteStreams, //: [...prevState.remoteStreams, remoteVideo] // state
			// 	}
			// })


			if (remoteVideo){
				console.log('remoteVideo IS AVAILABLE')
			}

			( object.props.remoteStreams.length > 0 ) ? object.props.set_remotestream( e.stream ) : object.props.set_remotestream( {} ) 
			object.props.set_selectedvideo( remoteVideo )
			let selectedVideo = object.props.remoteStreams.filter(stream => stream.id === object.props.selectedVideo.id)
			object.props.set_selectedvideo( selectedVideo )
			// selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo } // state
			// object.props.set_selectedvideo( selectedVideo )
			// object.props.set_remotesteams( remoteStreams )
		}	


		//# THIS WILL BE TRIGGERED WHEN PEER CONNECTION IS ENDED
		pc.close = () => {
			// alert('GONE')
		}

// {
// 	"_dataChannelIds": Set {1}, 
// 	"_localStreams": [{"_reactTag": "e59791c3-46aa-43bd-808b-e6f7e87f4166", "_tracks": [Array], "active": true, "id": "e59791c3-46aa-43bd-808b-e6f7e87f4166"}], 
// 	"_peerConnectionId": 3, 
// 	"_remoteStreams": [], 
// 	"_subscriptions": [{
// 		"context": undefined, 
// 		"emitter": [RCTDeviceEventEmitter], 
// 		"eventType": "peerConnectionOnRenegotiationNeeded", "key": 3, 
// 		"listener": [Function anonymous], 
// 		"subscriber": [EventSubscriptionVendor]},
// 		 {"context": undefined, 
// 		 "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionIceConnectionChanged", "key": 3, 
// 		 "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionSignalingStateChanged", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionAddedStream", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionRemovedStream", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "mediaStreamTrackMuteChanged", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionGotICECandidate", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionIceGatheringChanged", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]}, 
// 		 {"context": undefined, "emitter": [RCTDeviceEventEmitter], 
// 		 "eventType": "peerConnectionDidOpenDataChannel", "key": 3, "listener": [Function anonymous], "subscriber": [EventSubscriptionVendor]
// 	}], 
// 	"close": [Function anonymous], 
// 		 "iceConnectionState": "new", "iceGatheringState": "new", "signalingState": "stable"
// }


		if (object.props.localStream) {
			pc.addStream(object.props.localStream)

		//   // object.state.localStream.getTracks().forEach(track => {
		//   //   pc.addTrack(track, object.state.localStream)
		//   // })
		}
		// return pc
		callback(pc)

		if (pc){
			console.log('pc CREATED')
			console.log(pc)
		}


	} catch (err) {

		console.log('Something went wrong! pc not created!!')
		my_logger('err', err, 'error', 'createPeerConnection', 0)
		callback(null)

	}

	my_logger(null, null, 'function_exiting', 'createPeerConnection', 0)
	
}


//# MY FUNCTION, CREATED SO THAT WE WILL USE NEEDED
// create_offer_through_pc(sdpConstraints, socket_ID){
// 	if (object.props.createOffer){
// 		pc.createOffer(sdpConstraints)
// 		.then(sdp => {
// 			pc.setLocalDescription(sdp)

// 			console.log('sendToPeer triggered in line 354')

// 			sendToPeer(object, 'offer', sdp, {
// 				local: object.props.live_socket.id,
// 				remote: socket_ID
// 			})
// 		})
// 	}
// }


// on connection-success event
	// joining a room
	// getting local stream  (:::THINKING OF IT TO USE ONLY WHEN CALL IS ANSWERED) # DONE
	// setting status redux
	// set messages obtained by server redux (:::CAN BE SET ACCORDINGLY)
// on joined-peers event
	// set status redux
// on peer-disconnect event (:::ONLY TO BE USED WHEN CALL IS ENDED)
	// set_remotesteams redux
	// set_selectedvideo redux
	// set_status redux
// online-peers event (THIS CREATES AND SENDS OFFER TO ALL) (:::ONLY TO BE USED WHEN CALL IS SENT)
	// createPeerConnection func
		// add_to_sendchannels redux
	// handleReceiveMessage function
		// add_to_messages redux
	// receiveChannelCallback func		
		// handleReceiveMessage
	// pc.createOffer(object.state.sdpConstraints)
// offer event (THIS CREATES ANSWERS AND SENDS TO ALL) (:::ONLY TO BE USED WHEN CALL IS ANSWERED)
	// add_to_sendchannels redux
// answer event
// candidate event
// NOT TO USE
// joinRoom function WITH AUTO CONFERENCE CALL
// joinRoom = (object) => {
// 	// reduxified
// 	// object.setState({ 
// 	// 	connect: true, // state
// 	// })
// 	object.props.set_connect( true )


// 	const room = object.props.room || ''

// 	object.socket = io.connect(
// 		object.serviceIP,
// 		{
// 			path: '/io/webrtc',
// 			query: {
// 				// room: `/${room}`, //'/',
// 				room: `/room1`, //'/',
// 			}
// 		}
// 	)

// 	object.socket.on('connection-success', data => {

// 		// object.getLocalStream() // SHIFTED TO online-peers event

// 		console.log(data.success)
// 		const status = data.peerCount > 1 ? `Total Connected Peers to room ${object.props.room}: ${data.peerCount}` : object.props.status
// 		// reduxified
// 		// object.setState({ // state
// 		// 	status,
// 		// 	messages: data.messages
// 		// })
// 		object.props.set_status( status )
// 		object.props.set_messages( (data.messages == null ? [] : data.messages)  )

// //# THIS IS WHATS GETTING AND STORING THE INCOMING MESSAGES
// 		object.socket.on('message', data => {
// 			console.log('message', data)
// 			object.props.add_to_messages( data )
// 			console.log('MESSAGES ARE BELOW')
// 			console.log( object.props.messages )
// 		})

// 	})

// 	object.socket.on('joined-peers', data => {
// 		// reduxified
// 		// object.setState({ // state
// 		// 	status: data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : 'Waiting for other peers to connect'
// 		// })
// 		object.props.set_status( data.peerCount > 1 ? `Total Connected Peers to room ${object.props.room}: ${data.peerCount}` : 'Waiting for other peers to connect' )
// 	})

// 	object.socket.on('peer-disconnected', data => {
// 		console.log('peer-disconnected', data)

// 		const remoteStreams = object.props.remoteStreams.filter(stream => stream.id !== data.socketID)
		
// 		// reduxified
// 		// object.setState(prevState => { // state
// 		// 	// check if disconnected peer is the selected video and if there still connected peers, then select the first
// 		// 	const selectedVideo = prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null

// 		// 	return {
// 		// 		// remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
// 		// 		remoteStreams,
// 		// 		...selectedVideo,
// 		// 		status: data.peerCount > 1 ? `Total Connected Peers to room ${object.state.room}: ${data.peerCount}` : 'Waiting for other peers to connect'
// 		// 	}
// 		// })
// 		object.props.set_remotesteams( remoteStreams )
// 		object.props.set_selectedvideo( selectedVideo )
// 		object.props.set_status( data.peerCount > 1 ? `Total Connected Peers to room ${object.props.room}: ${data.peerCount}` : 'Waiting for other peers to connect' )
// 	})

// // THIS BLOCK IS WHERE ALL THE ONLINE PEERS ARE BEING SENT createOffer

// 	//# HERE WE TRYING TO createPeerConnection TO ONLINE COMING PERSON
// 	//# ALSO HERE WE GETTING LOCAL STREAM, DATA CHANNEL, MEANS WE STARTING PROCESS HERE
// 	object.socket.on('online-peer', socketID => {
// 		// debugger
// 		console.log('connected peers ...', socketID)

// 		// create and send offer to the peer (data.socketID)
// 		// 1. Create new pc
// 		createPeerConnection(object, socketID, pc => {
// 			// 2. Create Offer
// 			if (pc) {
				
// 				getLocalStream(object) // SHIFTED FROM connection-success event, commented out there

// 				// Send Channel
// 				const handleSendChannelStatusChange = (event) => {
// 					console.log('send channel status: ' + object.props.sendChannels[0].readyState)
// 				}

// 				const sendChannel = pc.createDataChannel('sendChannel')
// 				sendChannel.onopen = handleSendChannelStatusChange
// 				sendChannel.onclose = handleSendChannelStatusChange

// 				// reduxified		
// 				// object.setState(prevState => { // state
// 				// 	return {
// 				// 		sendChannels: [...prevState.sendChannels, sendChannel]
// 				// 	}
// 				// })
// 				object.props.add_to_sendchannels( sendChannel )

// 				// Receive Channels
// 				const handleReceiveMessage = (event) => {
// 					const message = JSON.parse(event.data)
// 					console.log(message)
// 					// reduxified
// 					// object.setState(prevState => { // state
// 					// 	return {
// 					// 		messages: [...prevState.messages, message]
// 					// 	}
// 					// })
// 					object.props.add_to_messages( message )
// 				}

// 				const handleReceiveChannelStatusChange = (event) => {
// 					if (object.receiveChannel) {
// 						console.log("receive channel's status has changed to " + object.receiveChannel.readyState);
// 					}
// 				}

// 				const receiveChannelCallback = (event) => {
// 					const receiveChannel = event.channel
// 					receiveChannel.onmessage = handleReceiveMessage
// 					receiveChannel.onopen = handleReceiveChannelStatusChange
// 					receiveChannel.onclose = handleReceiveChannelStatusChange
// 				}

// 				pc.ondatachannel = receiveChannelCallback

// 				// CREATED A FUNCTION FOR BELOW AND WILL BE USED WHEN NEEDED
// 				// pc.createOffer(object.state.sdpConstraints)
// 				// .then(sdp => {
// 				// 	pc.setLocalDescription(sdp)

// 				// 	console.log('sendToPeer triggered in line 354')

// 				// 	sendToPeer(object, 'offer', sdp, {
// 				// 		local: object.props.live_socket.id,
// 				// 		remote: socketID
// 				// 	})
// 				// })
// 				// create_offer_through_pc(object.state.sdpConstraints, socketID)
// 			}
// 		})
// 	})

// // THIS BLOCK IS WHERE createAnswer IS DONE WHEN OFFER IS ACHIEVED
// 	//# HERE WE ARE USING createPeerConnection ON ANYONE OFFERING US
// 	object.socket.on('offer', data => {
// 		createPeerConnection(object, data.socketID, pc => {
// 			if (pc) {

// 				pc.addStream(object.props.localStream)

// 				// Send Channel
// 				const handleSendChannelStatusChange = (event) => {
// 					console.log('send channel status: ' + object.props.sendChannels[0].readyState)
// 				}

// 				const sendChannel = pc.createDataChannel('sendChannel')
// 				sendChannel.onopen = handleSendChannelStatusChange
// 				sendChannel.onclose = handleSendChannelStatusChange

// 				// reduxified			
// 				// object.setState(prevState => { // state
// 				// 	return {
// 				// 		sendChannels: [...prevState.sendChannels, sendChannel]
// 				// 	}
// 				// })
// 				object.props.add_to_sendchannels( sendChannel )

// 				// Receive Channels
// 				const handleReceiveMessage = (event) => {
// 					const message = JSON.parse(event.data)
// 					console.log('MESSAGE RECIEVED THROUGH webRTC BELOW')
// 					console.log(message)
// 					// reduxified
// 					// object.setState(prevState => { // state
// 					// 	return {
// 					// 		messages: [...prevState.messages, message]
// 					// 	}
// 					// })
// 					object.props.add_to_messages( message )
// 				}

// 				const handleReceiveChannelStatusChange = (event) => {
// 					if (object.receiveChannel) {
// 						console.log("receive channel's status has changed to " + object.receiveChannel.readyState);
// 					}
// 				}

// 				const receiveChannelCallback = (event) => {
// 					const receiveChannel = event.channel
// 					receiveChannel.onmessage = handleReceiveMessage
// 					receiveChannel.onopen = handleReceiveChannelStatusChange
// 					receiveChannel.onclose = handleReceiveChannelStatusChange
// 				}

// 				pc.ondatachannel = receiveChannelCallback
// 	// debugger
// 				//# setRemoteDescription IS FOR OTHER PEER FROM WHOM OFFER IS RECEIVED 
// 				pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
// 					// 2. Create Answer
// 					pc.createAnswer(object.state.sdpConstraints)
// 					.then(sdp => {
// 						pc.setLocalDescription(sdp)

// 						console.log('sendToPeer triggered in line 420')

// 						sendToPeer(object, 'answer', sdp, {
// 							local: object.props.live_socket.id,
// 							remote: data.socketID
// 						})
// 					})
// 				})
// 			}
// 		})
// 	})

// 	//# ON answer JUST setRemoteDescription WILL BE MADE, REST WAS DONE PREVIOUSLY
// 	object.socket.on('answer', data => {
// 		// get remote's peerConnection
// 		// const pc = object.props.peerConnections[ [data.socketID] ]
// 		const pc = object.props.peerConnections.get( data.socketID )

// 		console.log( '-------------data.socketID---------------')
// 		console.log ( data.socketID )


// 		console.log( '-------------pc---------------')
// 		console.log ( pc )


// 		console.log( '-------------peerconnections in 464---------------')
// 		console.log ( object.props.peerConnections )

// 		// console.log(data.sdp)
// 		pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
// 	})

// // add_to_peerconnections
// 	//# THIS IS USED, WHEN CALL INITIATER SENDS US candidate EMIT THROUGH SERVER 
// 	object.socket.on('candidate', (data) => {
// 		// get remote's peerConnection
// 		const pc = object.props.peerConnections.get( data.socketID )

// 		if (pc)
// 			pc.addIceCandidate(new RTCIceCandidate(data.candidate))
// 	})
// }


//# FUNCTION THAT SWITCHES VIDEO TO SELECTED ONE
switchVideo = (object, video) => {

	console.log('switchVideo TRIGGERED')

	my_logger(null, null, 'function_entering', 'switchVideo', 0)

	try{

		// debugger
		// alert(_video)
		// reduxified
		// object.setState({ // state
		// 	selectedVideo: _video
		// })
		object.props.set_selectedvideo( video )
	
		// my_logger('returned_value', returned_value, 'function_returning', 'switchVideo', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'switchVideo', 0)


	}

	my_logger(null, null, 'function_exiting', 'switchVideo', 0)
	
}

stopTracks = (stream) => {

	console.log('stopTracks TRIGGERED')

	my_logger(null, null, 'function_entering', 'stopTracks', 0)

	try{

		stream.getTracks().forEach(track => track.stop())
	
		// my_logger('returned_value', returned_value, 'function_returning', 'stopTracks', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'stopTracks', 0)


	}

	my_logger(null, null, 'function_exiting', 'stopTracks', 0)
	
}


//# FUNCTION CREATED, BUT NOT USED
send_message = (object, message) => {

	console.log('send_message TRIGGERED')

	my_logger(null, null, 'function_entering', 'send_message', 0)

	try{

		// console.log('message in send_message function')
		// console.log(message)
		// console.log('sendToPeer triggered in send_message')
		sendToPeer(object, 'new-message', message, {local: object.props.live_socket.id})

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


makePhoneCall = (object, socketID) => {

	console.log('makePhoneCall TRIGGERED')

	// create and send offer to the peer (data.socketID)
	// 1. Create new pc
	createPeerConnection(object, socketID, pc => {
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

				sendToPeer(object, 'offer', 
					{
						sdp: sdp,
						local: object.props.live_socket.id,
						remote: socketID,
						room: message.room_
					},
					object.props.live_socket.id,
				)

			})
		}
	})
		
}


makeVideoCall = (object, socketID) => {

	console.log('makeVideoCall TRIGGERED')
	// create and send offer to the peer (data.socketID)
	// 1. Create new pc
	createPeerConnection(object, socketID, pc => {
		// 2. Create Offer
		if (pc) {
			
			getLocalStream(object) // SHIFTED FROM connection-success event, commented out there

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

			if (sendChannel){
				console.log('sendChannel is AVAILABLE')
			}

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
			pc.createOffer(object.state.sdpConstraints)
			.then(sdp => {
				pc.setLocalDescription(sdp)

				console.log('sendToPeer triggered in createOffer')

				// sendToPeer(object, 'offer', sdp, {
				// 	local: object.props.live_socket.id,
				// 	remote: socketID
				// })

				sendToPeer(object, 'offer', 
					{
						sdp: sdp,
						local: object.props.live_socket.id,
						remote: socketID,
						room: message.room_
					},
					object.props.live_socket.id,
				)


				console.log('OFFER SENT USING sendToPeer')
			})
		}
	
		console.log('object.props.remoteStream')
		console.log(object.props.remoteStream)
	})

}

// socket.emit( 'join-room', {room_string: new_message.room_string} )

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


// sendMessageInSocket = (object, message, room_name) => {


// 	// let sockets_already_created = object.props.all_socket_rooms.keys()
// 	// console.log('sockets_already_created')
// 	// console.log(sockets_already_created)
// 	// // let user_details = getStoredObject('self_user_details')
// 	// let user_details = {user_name: object.props.own_name, user_number: object.props.own_number}

// 	// if ( sockets_already_created != {} ){

// 	// 	// object.socket = joinRoom(object, room_name)		
// 	// 	joinRoom(object, room_name)// NO NEED TO RETURN FROM IT		
// 	// 	console.log('object.socket')
// 	// 	console.log(object.socket)
// 	// 	assign_socket_events( object.socket, object )
// 	// 	console.log('ASSIENMENT OF SOCKET EVENT COMPLETE and socket is below')		

// 	// 	object.socket.emit('new-message', {user_details: user_details, message: message})

// 	// } else {

// 	// 	// console.log('SIZE IS BELOW')
// 	// 	// console.log(object.props.all_socket_rooms.size)
// 	// 	object.socket = object.props.all_socket_rooms.get(room_name)
// 	// 	assign_socket_events( object.socket, object )
// 	// 	console.log('ASSIENMENT OF SOCKET EVENT COMPLETE')		

// 	// 	console.log('ASSIENMENT OF SOCKET EVENT COMPLETE and socket is below')		

// 	// 	console.log(object.socket)

// 	// 	object.socket.emit('new-message', {user_details: user_details, message: message})

// 	// }



// 	// --------------------------- NEW APPROACH ----------------------------
// 	// object.socket.emit( 'join-room', {room_string: room_name} )
// 	// object.socket.emit('new-message', {user_details: user_details, message: message})
// }

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