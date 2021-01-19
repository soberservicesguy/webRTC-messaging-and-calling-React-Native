const initialState = {
	live_socket:null,
	socket_id:'',

	own_name:'',
	own_number:0,

	contacts:[],

	permissions_granted_for_contacts: false,

	isSignedIn: false, // 

	selectedVideo: null,
	remoteStream: null,
	remoteStreams: [],    // holds all Video Streams (all remote streams)
	localStream: null,
	peerConnections: new Map(),  // holds all Peer Connections
	sendChannels: [],
	disconnected: false,
	room: null,
	connect: false,
	status: 'Please wait...',


	all_chatnodes: [], 
	// all_rooms: [],
	// all_socket_rooms: new Map(),
	// sockets_listening: [],

	current_chat_screen_room_string: '',

	messages: [],
	new_messages_of_current_room: [],

	call_incoming: false,
	videocall_incoming: false,
	call_outgoing: false,
	videocall_outgoing: false,

	is_internet_connected: false,
	network_state_permission: false,


	pc_config: {
		"iceServers": [
			{
				"url" : 'stun:stun.l.google.com:19302'
			},
		]
	},
	sdpConstraints: {
		'mandatory': {
			'OfferToReceiveAudio': true,
			'OfferToReceiveVideo': true
		}
	},
	sdpConstraintsForVoiceCall: {
		'mandatory': {
			'OfferToReceiveAudio': true,
			'OfferToReceiveVideo': false,
		}				
	},
	camera: true,
	mic: true,
	// serviceIP: 'https://74635b627c3b.ngrok.io', // webrtcPeer is namespace

}

const reducerForRTC = (state = initialState, action) => {

	switch (action.type) {

		case "SET_SOCKET":
			return {...state, live_socket: action.socket_object}
		
		case "SET_SOCKET_ID":
			return {...state, socket_id: action.socket_id}

		case "ADD_TO_CHATNODES":
			return {...state, all_chatnodes:[action.chat_node, ...state.all_chatnodes]}


		case "SET_NETWORK_READING_PERMISSION":

			return {...state, network_state_permission: action.boolean }
			// return {...state, new_messages_of_current_room: action.new_message }
			break;


		case "CLEAR_PREVIOUS_NEW_MESSAGES_OF_OLD_ROOM":

			return {...state, new_messages_of_current_room: [] }
			// return {...state, new_messages_of_current_room: action.new_message }
			break;



		case "ADD_TO_MESSAGES_OF_CURRENT_ROOM":

			return {...state, new_messages_of_current_room: [ ...state.new_messages_of_current_room, action.new_message ] }
			// return {...state, new_messages_of_current_room: action.new_message }
			break;



		case "SET_CURRENT_ROOM_STRING":

			return {...state, current_chat_screen_room_string: action.room_string }

			break;



		case "SET_OWN_NAME":

			return {...state, own_name: action.own_name }

			break;


		case "SET_OWN_NUMBER":

			return {...state, own_number: action.phone_number }

			break;


		case "SET_CONTACTS":

			return {...state, contacts: action.contacts_list }

			break;


		case "SET_PERMISSIONS_STATUS_FOR_CONTACTS":

			return {...state, permissions_granted_for_contacts: action.booleon }

			break;

		case "SET_SIGN_IN_STATUS":

			return {...state, isSignedIn: action.booleon }

			break;

		case "SET_LOCALSTREAM":

			return {...state, localStream: action.local_stream }

			break;

		case "SET_REMOTESTREAM":

			return {...state, remoteStream: action.remote_stream}

			break;

		case "SET_REMOTESTREAMS":

			return {...state, remoteStreams: action.remote_streams}

			break;

		case "ADD_TO_REMOTESTREAMS":

			return {...state, remoteStreams:[...state.remoteStreams, action.remote_stream]}

			break;

		case "REMOVE_FROM_REMOTESTREAMS":

			return {...state, remoteStreams: [...state.remoteStreams.filter( (item) => item.id !== action.remote_stream_id ) ] }

			break;

		case "ADD_TO_PEERCONNECTIONS":

			let newPeerConnections = new Map()
			newPeerConnections.set( action.peer_connection_key, action.peer_connection_value )
			// newPeerConnections = { ...state.peerConnections }

			for (const [key, value] of state.peerConnections.entries()) {
				newPeerConnections.set( key, value)
			}

			return {...state, peerConnections: newPeerConnections }

			break;

		case "REMOVE_FROM_PEERCONNECTIONS":

			// peer_connection_object = new Map()
			let peer_connection_object = { ...state.peerConnections }

			peer_connection_object.delete(action.peer_connection_key)
			
			return {...state, peerConnections: peer_connection_object }

			break;

		case "SET_PEERCONNECTIONS":

			return {...state, peerConnections: action.peer_connections}

			break;

		case "SET_SELECTEDVIDEO":

			return {...state, selectedVideo: action.selected_video}

			break;

		case "SET_MESSAGES":

			return {...state, messages: action.messages_list}

			break;

		case "ADD_TO_MESSAGES":

			return {...state, messages: [...state.messages, ...action.message]}

			break;

		case "REMOVE_FROM_MESSAGES":

			return {...state, messages: [...state.messages.filter( (item) => item.id !== action.message_id ) ] }

			break;

		case "ADD_TO_SENDCHANNELS":

			return {...state, sendChannels: [...state.sendChannels, action.sendchannel]}

			break;

		case "REMOVE_FROM_SENDCHANNELS":

			return {...state, sendChannels: [...state.sendChannels.filter( (item) => item.id !== action.sendchannel_id ) ] }

			break;

		case "SET_DISCONNECTED":

			return {...state, disconnected: state.disconnected ? false : true}

			break;

		case "SET_ROOM":

			return {...state, room: action.room}

			break;

		case "SET_CONNECT":

			return {...state, connect: action.connect_booleon}

			break;

		case "SET_STATUS":

			return {...state, status: action.status}

			break;

		case "SET_VIDEOTRACK_ON_CAMERA":

			return {...state, camera: action.video_track}

			break;

		case "SET_AUDIOTRACK_ON_CAMERA":

			return {...state, mic: action.audio_track}

			break;


		case "SET_CHATNODES":

			return {...state, all_chatnodes: action.chatnodes_list }

			break;

		case "ADD_TO_SOCKET_ROOMS":

			let newSocketrooms = new Map()
			newSocketrooms.set( action.room_string, action.created_socket )
			// newSocketrooms = { ...state.Socketrooms }

			for (const [key, value] of state.all_socket_rooms.entries()) {
				newSocketrooms.set( key, value)
			}

			return {...state, all_socket_rooms: newSocketrooms }

			break;


		case "SET_OUTGOING_CALL":

			return {...state, call_outgoing: action.boolean}

			break;

		case "SET_INCOMING_VIDEOCALL":

			return {...state, videocall_incoming: action.boolean}

			break;


		case "SET_OUTGOING_VIDEOCALL":

			return {...state, videocall_outgoing: action.boolean}

			break;


		case "SET_INCOMING_CALL":

			return {...state, call_incoming: action.boolean}

			break;


		case "SET_INTERNET_CONNECTION":

			return {...state, is_internet_connected: action.boolean}

			break;


		default:

			return state

	}

};

export default reducerForRTC;