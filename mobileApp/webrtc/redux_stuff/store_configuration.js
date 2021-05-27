import {createStore, applyMiddleware} from "redux";
import createSagaMiddleware from "redux-saga";
import { connect } from "react-redux";
import { combineReducers } from 'redux'; 


// IMPORT rootSaga
import {rootSaga} from "../saga_stuff/saga_combined";

import {
	reducerForRTC,
} from "./reducers"

export const rootReducer = combineReducers({
	RTC: reducerForRTC,
});

export const mapStateToProps = state => {
	return {
		live_socket: state.RTC.live_socket,
		socket_id: state.RTC.socket_id,

		messages: state.RTC.messages,
		new_messages_of_current_room: state.RTC.new_messages_of_current_room,

		own_name: state.RTC.own_name,
		own_number: state.RTC.own_number,

		message_recipents_number: state.RTC.recipents_number,
		message_recipents_name: state.RTC.recipents_name,

		contacts: state.RTC.contacts,

		contactsPermissionsGranted: state.RTC.permissions_granted_for_contacts,

		isSignedIn: state.RTC.isSignedIn,


		localStream: state.RTC.localStream,
		remoteStream: state.RTC.remoteStream,
		remoteStreams: state.RTC.remoteStreams,

		peerConnections: state.RTC.peerConnections,
		selectedVideo: state.RTC.selectedVideo,
		sendChannels: state.RTC.sendChannels,
		disconnected: state.RTC.disconnected,
		room: state.RTC.room,
		connect: state.RTC.connect,
		status: state.RTC.status,

		all_chatnodes: state.RTC.all_chatnodes,
		all_socket_rooms: state.RTC.all_socket_rooms,
		sockets_listening: state.RTC.sockets_listening,
		current_chat_screen_room_string: state.RTC.current_chat_screen_room_string,

		call_incoming: state.RTC.call_incoming,
		videocall_incoming: state.RTC.videocall_incoming,
		call_outgoing: state.RTC.call_outgoing,
		videocall_outgoing: state.RTC.videocall_outgoing,

		is_internet_connected: state.RTC.is_internet_connected,
		network_state_permission: state.RTC.network_state_permission,


	};
};

export const mapDispatchToProps = dispatch => {
	return {

		set_recipents_name: (recipents_name) => dispatch( { type:"SET_RECIPENTS_NAME", recipents_name: recipents_name } ), 
		set_recipents_number: (recipents_number) => dispatch( { type:"SET_RECIPENTS_NUMBER", recipents_number: recipents_number } ), 



		set_socket: (socket_object) => dispatch( { type:"SET_SOCKET", socket_object: socket_object } ), 
		set_own_socket_id: (socket_id) => dispatch( { type:"SET_SOCKET_ID", socket_id: socket_id } ), 

		set_own_name: (own_name) => dispatch( { type:"SET_OWN_NAME", own_name: own_name } ),
		set_own_number: (phone_number) => dispatch( { type:"SET_OWN_NUMBER", phone_number:phone_number } ),

		set_contacts_list: (contacts_list) => dispatch( { type:"SET_CONTACTS", contacts_list: contacts_list } ),

		set_permissions_granted_for_contacts: (booleon) => dispatch( { type:"SET_PERMISSIONS_STATUS_FOR_CONTACTS", booleon: booleon }),

		set_signed_in_status: (booleon) => dispatch( { type:"SET_SIGN_IN_STATUS", booleon: booleon }),

		set_localstream: (local_stream) => dispatch( { type: "SET_LOCALSTREAM", local_stream: local_stream } ),
		add_to_peerconnections: (peer_connection_key, peer_connection_value) => dispatch( { type: "ADD_TO_PEERCONNECTIONS", peer_connection_key: peer_connection_key, peer_connection_value: peer_connection_value } ),
		remove_from_peerconnections: (peer_connection_key) => dispatch( { type: "REMOVE_FROM_PEERCONNECTIONS", peer_connection_key: peer_connection_key } ),
		set_peerconnections: (peer_connections) => dispatch( { type: "SET_PEERCONNECTIONS", peer_connections: peer_connections } ),
		set_remotestream: (remote_stream) => dispatch( { type: "SET_REMOTESTREAM", remote_stream: remote_stream } ),
		set_remotesteams: (remote_streams) => dispatch( { type: "SET_REMOTESTREAMS", remote_streams: remote_streams } ),
		add_to_remotestreams: (remote_stream) => dispatch( { type: "ADD_TO_REMOTESTREAMS", remote_stream: remote_stream } ),
		remove_from_remotestreams: (remote_stream_id) => dispatch( { type: "REMOVE_FROM_REMOTESTREAMS", remote_stream_id: remote_stream_id } ),
		set_selectedvideo: (selected_video) => dispatch( { type: "SET_SELECTEDVIDEO", selected_video: selected_video } ),
		
		add_to_messages: (...message) => dispatch( { type: "ADD_TO_MESSAGES", message: message } ),
		remove_from_messages: (message_id) => dispatch( { type: "REMOVE_FROM_MESSAGES", message_id: message_id } ),
		set_messages: (messages_list) => dispatch( {type: "SET_MESSAGES", messages_list: messages_list} ),
		
		add_to_new_message_of_current_room: (new_message) => dispatch( { type:"ADD_TO_MESSAGES_OF_CURRENT_ROOM", new_message: new_message } ),
		clear_all_previous_new_messages_of_old_room: () => dispatch( { type:"CLEAR_PREVIOUS_NEW_MESSAGES_OF_OLD_ROOM" } ),

		add_to_sendchannels: (sendchannel) => dispatch( { type: "ADD_TO_SENDCHANNELS", sendchannel: sendchannel } ),
		remove_from_sendchannels: (sendchannel_id) => dispatch( { type: "REMOVE_FROM_SENDCHANNELS", sendchannel_id: sendchannel_id } ),
		set_disconnected: () => dispatch( { type: "SET_DISCONNECTED"} ),
		set_connect: (connect_booleon) => dispatch( {type: "SET_CONNECT", connect_booleon: connect_booleon} ),
		set_room: (room) => dispatch( { type: "SET_ROOM", room: room } ),
		set_status: (status) => dispatch( { type: "SET_STATUS", status: status } ),
		set_videotrack_on_camera: (video_track) => dispatch( { type: "SET_VIDEOTRACK_ON_CAMERA", video_track: video_track } ),
		set_audiotrack_on_camera: (audio_track) => dispatch( { type: "SET_AUDIOTRACK_ON_CAMERA", audio_track: audio_track } ),

		set_current_room_string: (room_string) => dispatch( { type: "SET_CURRENT_ROOM_STRING", room_string: room_string } ),

		// add_to_messages: (message) => dispatch( { type:"ADD_TO_MESSAGES", message: message } ),
		set_chatnodes: (chatnodes_list) => dispatch( { type:"SET_CHATNODES", chatnodes_list: chatnodes_list } ),
		add_to_chatnodes: (chat_node) => dispatch( { type:"ADD_TO_CHATNODES", chat_node: chat_node } ),

		add_to_socket_rooms: (room_string, created_socket) => dispatch( { type:"ADD_TO_SOCKET_ROOMS", room_string: room_string, created_socket: created_socket } ),
		set_call_outgoing: (boolean) => dispatch( { type:"SET_OUTGOING_CALL", boolean: boolean } ),
		set_videocall_incoming: (boolean) => dispatch( { type:"SET_INCOMING_VIDEOCALL", boolean: boolean } ),
		set_videocall_outgoing: (boolean) => dispatch( { type:"SET_boolean", boolean: outgoing_videocall } ),
		set_call_incoming: (boolean) => dispatch( { type:"SET_INCOMING_CALL", boolean: boolean } ),

		set_internet_connection: (boolean) => dispatch( { type:"SET_INTERNET_CONNECTION", boolean: boolean } ),
		set_network_state_permission: (boolean) => dispatch( { type:"SET_NETWORK_READING_PERMISSION", boolean: boolean } ),
	};
};

const sagaMiddleWare = createSagaMiddleware();

export const store = createStore(rootReducer, applyMiddleware(sagaMiddleWare));

sagaMiddleWare.run(rootSaga);