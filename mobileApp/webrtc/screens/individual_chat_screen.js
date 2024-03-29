import React, {Component} from 'react';
// IMPORT classes to use
import { 
	FlatList,
	TextInput,
	ImageBackground,
	View,
	ScrollView,
	StyleSheet, 
	Image,
	Text,
	TouchableOpacity,
	TouchableHighlight,
} from "react-native";

// IMPORT components without store / redux
import {

} from "../components";
// IMPORT connected components
// import {ConnectedSomeComponent} from "../redux_stuff/connected_components";
const { my_logger } = require('../handy_functions/my_custom_logger')

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Icon } from 'react-native-elements';
import axios from 'axios';

import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

import utils from "../utilities";

import { setObjectValue } from "../handy_functions/asyncstorage_function"

import { 
	messageToRelevantChatNodeOnIndividualScreen,
	generate_proper_room_string,
	makeVideoCall,
 } from "../handy_functions/RTC_video_conference_call_functions"

import {
	RTCView, // not used
} from 'react-native-webrtc';


import {eventEmitter} from '../handy_functions/events_management'

export default class IndividualChatScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// messages:this.props.all_messages,
			// messages:messageToRelevantChatNodeOnIndividualScreen(this.props.current_chat_screen_room_string),
			// messages:[],
			message_being_typed:'',
			stream:null,



			localStream: null,    // used to hold local stream object to avoid recreating the stream everytime a new offer comes
			remoteStream: null,    // used to hold remote stream object that is displayed in the main screen

			remoteStreams: [],    // holds all Video Streams (all remote streams)
			peerConnections: {},  // holds all Peer Connections
			selectedVideo: null,

			status: 'Please wait...',

			// global AVAILABLE IN REDUX
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

			messages: [],
			sendChannels: [],
			disconnected: false,
			// room: null,
			// connect: false,
			camera: true,
			mic: true,

		}
	}


	getUserAvatar(){

		let { phone_number } = this.props.route.params;


		let setRecipentsAvatar = (response) => this.props.set_recipents_avatar(response.data.image)

		axios.get(utils.baseURL + '/users/get-avatar', {
			params:{
				user_phone_number: phone_number
			}
		})
		.then(function (response) {


			// console.log(JSON.stringify(response.data));
			if (response.data.success){
				setRecipentsAvatar(response)
			}

		})
		.catch(function (error) {
			console.log(error);
		});

	}

	componentDidMount() {
		this._unsubscribeFocus = this.props.navigation.addListener('focus', () => {
		
			// below will be executed when user enters this screen

			this.getUserAvatar()
			

		// COLLECTING OLD MESSAGES AND SHOWING 
			let { phone_number } = this.props.route.params;

			let original_room_string = ( Number(phone_number) < Number(this.props.own_number) ) ? `${phone_number}-${this.props.own_number}+` : `${this.props.own_number}-${phone_number}+`
			
			this.props.set_current_room_string(original_room_string)
			
			let room_string = this.props.current_chat_screen_room_string

			this.setMessages(room_string)

		// LISTENING FOR NEW MESSAGES AND SHOWING
				
			console.log(`USING ${original_room_string} AS REQUEST PAYLOAD`)
			axios.post(utils.baseURL + '/rooms/create-room', {room_string:original_room_string})
			.then(function (response) {
				console.log(JSON.stringify(response.data));
			})
			.catch(function (error) {
				console.log(error);
			});

		});

		this._unsubscribeBlur = this.props.navigation.addListener('blur', () => {
			// below will be executed when user leaves this screen
			console.log('I AM UNMOUNTED')

		});

	}

	componentWillUnmount() {
		this._unsubscribeFocus();
		this._unsubscribeBlur();

		this.props.clear_all_previous_new_messages_of_old_room()	

	}



	async setMessages(room_string){

		try{

			messageToRelevantChatNodeOnIndividualScreen(room_string, this)
			.then((messages) => {
				console.log({messages5: messages})
				if (messages === "[]"){
					this.props.set_messages([])
				} else {
					if (messages.length > 1){
						let texts = []
						if ( !texts.includes(`${sent_time}-${text}`) ){
							texts.push(`${sent_time}-${text}`)
						}
						messages.filter((message) => {
							let { sent_time, text } = message
							if ( texts.includes(`${sent_time}-${text}`) ){
								return true
							}
						})
						// if (messages[messages.length-1].text == messages[messages.length-2].text){
						// 	messages.pop()
						// }
					}
					this.props.set_messages(messages)
				}

			})
			.catch((err1) => {
				my_logger('err1', err1, 'error', 'setMessages' , 0)
			})


		} catch (err2) {
			my_logger('err2', err2, 'value', 'setMessages' , 0)
		}

	}

	set_message_alignment(item){

		let alignment = 'right'

		if ( item.senders_details != undefined && item.senders_details.match( /\d+(?=\+)/ ) ){
			let matches = item.senders_details.match( /\d+(?=\+)/ )
			alignment = ( matches[0] === String(this.props.own_number) ) ? 'right' : 'left'
		}

		return alignment
	}


	sendMessage(){


		let message = this.state.message_being_typed

		var currentDate = new Date().toLocaleDateString("en-US").split("/").join(" | ");
		var currentTime = new Date().toLocaleTimeString("en-US").split("/").join(" | ");

		let room_string = this.props.current_chat_screen_room_string
		room_string = generate_proper_room_string(room_string)

		message = {
			text: message, 
			room_string: room_string,
			message_state:  ( this.props.is_internet_connected ) ? 'sent' : 'offline_sent',
			sent_time: `${currentTime}_${currentDate}`,
			senders_details: `${this.props.own_name}-${this.props.own_number}+`,
			socketID:{local: this.props.socket_id},
		}

		eventEmitter.emit('new_entry_in_message', this, message)

	}

	render() {

		return(

			<KeyboardAwareScrollView>
				<View style={styles.screenContainer}>


					<FlatList // message at either left or right, check number if mine then to right, 
						snapToInterval={100} // set it to height of component
						data={ this.props.messages }
						renderItem={

							({ item }) => {
								console.log({all_messages:this.props.messages})
								if (this.set_message_alignment(item) === 'left'){

									console.log({item})
									return(
										
										<View style={{width:'100%', flexDirection:'row', alignItems:'flex-start', marginBottom:10}}>
											<View style={{
												flex:1,
												height: windowHeight * 0.1, // or 100
												justifyContent: 'center', // vertically centered
												alignSelf: 'flex-start', // horizontally centered
											}}>
												<Image 
													source={{uri: "data:image/jpeg;base64," + this.props.recipents_avatar}} 
													style={{
														width:70, 
														height:70,
														borderRadius: 300/2,
													}}
												/>
											</View>
											
											<View style={{
												flex:4,
											}}>
												<Text style={{
													width:'100%',
													textAlign: 'left',
													paddingLeft:0,
													fontSize: 20,
													color:'blue'
												}}>
													{item.text}
												</Text>
											</View>
										</View>

									)

								} else {
									console.log({item})
									return(

										<View style={{width:'100%', flexDirection:'row', alignItems:'flex-start', marginBottom:10}}>
											
											<View style={{
												flex:4,
											}}>
												<Text style={{
													width:'100%',
													textAlign: 'right',
													paddingRight:10,
													fontSize:20,
													color:'purple'
												}}>
													{item.text}
												</Text>
											</View>

											<View style={{
												flex:1,
												height: windowHeight * 0.1, // or 100
												justifyContent: 'center', // vertically centered
												alignSelf: 'center', // horizontally centered
											}}>
												<Image 
													source={{uri: "data:image/jpeg;base64," + this.props.own_avatar}}
													style={{
														width:70, 
														height:70,
														borderRadius: 300/2,
													}}
												/>
											</View>
										</View>

									)

								}
							}
						}
						keyExtractor={() => `${Math.floor(Math.random() * 100)}-${Math.random().toString(36).substring(7)}`}
						ref = {"flatList"}
						onContentSizeChange={()=> this.refs.flatList.scrollToEnd()}
					/>



				{
					this.state.localStream &&
					<RTCView
						streamURL={this.state.localStream.toURL()}
						style={{width:200, height:200}} 
					/>
				}

				{this.props.videocall_incoming && 
					<Button onPress={() => {}}>
						Accept Call
					</Button>
				}

				<Text>
					remoteStreams:{this.state.remoteStreams}
				</Text>

				<Text>
					remoteStream:{this.state.remoteStream}
				</Text>


				{this.state.remoteStreams.length > 0 && <VIEW>
					<Text>
						Video Call Available
					</Text>		
				</VIEW>
			}

				{
					this.state.remoteStreams.length > 0 &&
					this.state.remoteStreams.map((video_stream, index) => {
						console.log('VIDEO STREAM')
						{/*console.log(video_stream)*/}
						{/*console.log(video_stream.stream.toURL())*/}
						{/*console.log(video_stream.stream._tracks)*/}
						console.log('this.props.selectedVideo')
						console.log(this.state.selectedVideo)


						{/*this.setState(prev => ({...prev, stream: video_stream.stream}))*/}
						
						{/*if (index < 3){*/}
							return(
								<RTCView
									objectFit='cover'
									key={1}
							      zOrder={2}
									// console.log('VIDEO AVAILABLE')
									// streamURL={video_stream.stream.toURL()}
									// streamURL={video_stream.stream.toURL()}
									// streamURL={(this.state.stream !== null) ? this.state.stream.toURL() : null}
									// streamURL={this.props.selectedVideo}
									streamURL={this.state.selectedVideo.stream.toURL()}
									style={{width:200, height:200}} 
								/>
							)
						{/*}*/}
					})

				}


					<TouchableHighlight 
						activeOpacity={0.2} 
						onPress={() => makeVideoCall(this, this.props.current_chat_screen_room_string)}
						style={styles.buttonWithoutBG}
					>
						<Text style={styles.innerText}>
							Make Video Call
						</Text>
					</TouchableHighlight>
				

					<View style={styles.textinputContainer}>
						<TextInput
							style={styles.textinput}
							placeholder="Type A Message"
							placeholderTextColor = {utils.lightGrey}
							// maxLength=10
							// caretHidden=true
							// multiline=true
							// numberOfLines=3
							// value='dummy'
							// autoFocus=true
							onChangeText={ (text) => this.setState(prev => ({...prev, message_being_typed: text})) }
						/>
						
						<View style={styles.buttonContainer}>
							<TouchableOpacity style={styles.roundButton} activeOpacity={0.2}
								onPress={() => { this.sendMessage() }} 
							>
								<Text style={styles.text}>
									SEND
								</Text>
							</TouchableOpacity>
						</View>
					</View>
					
				</View>				
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	screenContainer:{
		width: windowWidth,
		height: windowHeight * 0.88
	},
	textinputContainer:{

		flexDirection: 'row',
		// marginTop: windowHeight * 0.05, // or 30  gap
		height: windowHeight * 0.1, // or 100
		width: '100%',
		justifyContent: 'center', // vertically centered
		alignSelf: 'center', // horizontally centered
		// backgroundColor: utils.lightGreen,
	},
	textinput:{
		flex:4,
		marginTop:20,
		textAlign:'left',
		borderWidth:1,
		borderColor:(utils.lightGrey),
		borderStyle:'solid',
		paddingLeft:20,
		paddingTop:15,
		paddingBottom:15,
		fontSize:18,
	},
	buttonContainer:{
		flex:1,
		// position:'relative',
		// top: windowHeight * 0.6,
		// display:'flex',
		flexDirection:'row',
		justifyContent: 'center',
		alignItems:'center', 
		height:100,
	},
	roundButton:{
		// borderRadius:10,
		// borderColor:'green',
		// borderWidth:2,
		backgroundColor: 'blue',
		// borderStyle:'solid',
	
		paddingLeft:5,
		paddingRight:5,
		paddingTop:10,
		paddingBottom:20,
	},
	text:{
		fontSize:20,
		color:'white',
		textAlign:'center',
	},

	buttonWithoutBG:{
		marginTop:5,
		marginBottom:5,
	},
	innerText:{
		textAlign: 'center',
		fontSize:20,
		fontWeight:'bold'
	},


})







































// import React, {Component} from 'react';
// // IMPORT classes to use
// import { 
// 	FlatList,
// 	TextInput,
// 	ImageBackground,
// 	View,
// 	StyleSheet, 
// 	Image,
// 	Text,
// 	TouchableOpacity,
// 	TouchableHighlight,
// } from "react-native";

// // IMPORT components without store / redux
// import {

// } from "../components";
// // IMPORT connected components
// // import {ConnectedSomeComponent} from "../redux_stuff/connected_components";
// const { my_logger } = require('../handy_functions/my_custom_logger')

// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

// import { Icon } from 'react-native-elements';
// import axios from 'axios';

// import { Dimensions } from 'react-native';
// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

// import utils from "../utilities";

// import { setObjectValue } from "../handy_functions/asyncstorage_function"

// import { 
// 	messageToRelevantChatNodeOnIndividualScreen,
// 	generate_proper_room_string,
// 	makeVideoCall,
//  } from "../handy_functions/RTC_video_conference_call_functions"

// import {
// 	RTCView, // not used
// } from 'react-native-webrtc';


// import {eventEmitter} from '../handy_functions/events_management'

// export default class IndividualChatScreen extends Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			// messages:this.props.all_messages,
// 			// messages:messageToRelevantChatNodeOnIndividualScreen(this.props.current_chat_screen_room_string),
// 			// messages:[],
// 			message_being_typed:'',
// 			stream:null,



// 			localStream: null,    // used to hold local stream object to avoid recreating the stream everytime a new offer comes
// 			remoteStream: null,    // used to hold remote stream object that is displayed in the main screen

// 			remoteStreams: [],    // holds all Video Streams (all remote streams)
// 			peerConnections: {},  // holds all Peer Connections
// 			selectedVideo: null,

// 			status: 'Please wait...',

// 			// global AVAILABLE IN REDUX
// 			pc_config: {
// 				"iceServers": [
// 					{
// 						"url" : 'stun:stun.l.google.com:19302'
// 					},
// 				]
// 			},

// 			sdpConstraints: {
// 				'mandatory': {
// 					'OfferToReceiveAudio': true,
// 					'OfferToReceiveVideo': true
// 				}
// 			},

// 			messages: [],
// 			sendChannels: [],
// 			disconnected: false,
// 			// room: null,
// 			// connect: false,
// 			camera: true,
// 			mic: true,

// 		}
// 	}


// 	getUserAvatar(){

// 		let { phone_number } = this.props.route.params;

// 		axios.get(utils.baseURL + '/users/get-avatar', {
// 			params:{
// 				phone_number: phone_number
// 			}
// 		})
// 		.then(function (response) {

// 			// console.log(JSON.stringify(response.data));
// 			if (response.data.success){

// 				this.props.set_recipents_avatar(response.data.image)	

// 			}

// 		})
// 		.catch(function (error) {
// 			console.log(error);
// 		});

// 	}



// 	componentDidMount(){

// 		// console.log('CALLED-------------')

// 		this.getUserAvatar()
		

// 	// COLLECTING OLD MESSAGES AND SHOWING 
// 		let { phone_number } = this.props.route.params;

// 		// phone_number = phone_number[0]
// 		// console.log('phone_number')
// 		// console.log(phone_number)
// 		// console.log('this.props.own_number')
// 		// console.log(this.props.own_number)

// 		let original_room_string = ( Number(phone_number) < Number(this.props.own_number) ) ? `${phone_number}-${this.props.own_number}+` : `${this.props.own_number}-${phone_number}+`
		
// 		console.log('room_string')
// 		console.log(room_string)
// 		console.log(`SETTING ${original_room_string} AS ROOM STRING`)
// 		this.props.set_current_room_string(original_room_string)
		

// 		console.log('current chat room string 1')
// 		console.log({1: this.props.current_chat_screen_room_string})



// 		console.log('switch chat room string 2')
// 		console.log({2: this.props.current_chat_screen_room_string})

// 		let room_string = this.props.current_chat_screen_room_string
// 		console.log(`ROOM STRING IN REDUX IS ${room_string}`)

// 		console.log('room_string FInal ')
// 		console.log(room_string)

// 		this.setMessages(room_string)

// 	// LISTENING FOR NEW MESSAGES AND SHOWING
	
// 		my_logger( null, null, 'function_exiting', 'componentDidMount' , 0)
				
// 		console.log(`USING ${original_room_string} AS REQUEST PAYLOAD`)
// 		axios.post(utils.baseURL + '/rooms/create-room', {room_string:original_room_string})
// 		.then(function (response) {
// 			console.log(JSON.stringify(response.data));
// 		})
// 		.catch(function (error) {
// 			console.log(error);
// 		});
				
// 	}

// 	componentWillUnmount(){


		
// 		my_logger( null, null, 'function_entering', 'componentWillUnmount' , 0)
		
// 		 // dont forget to try catch wrap entire function
		
		
// 		my_logger('this.props.clear_all_previous_new_messages_of_old_room', {arg_passed:'none', arg:'none'}, 'alert', 'componentWillUnmount', 1)	
// 		this.props.clear_all_previous_new_messages_of_old_room()	


		
// 		my_logger( null, null, 'function_exiting', 'componentWillUnmount' , 0)
		
// 		 // dont forget to try catch wrap entire function
		
		
// 	}

// 	async setMessages(room_string){

		
// 		my_logger( null, null, 'function_entering', 'setMessages' , 0)
		
// 		 // dont forget to try catch wrap entire function
		
				
// 		// console.log('ss OWN NAME IS BELOW')
		
// 		 // dont forget to try catch wrap entire function
		
		

// 		// let messages = await messageToRelevantChatNodeOnIndividualScreen(room_string)

// 		try{
// 			my_logger('messageToRelevantChatNodeOnIndividualScreen', {arg_passed:'room_string, this', args:[room_string, 'this']}, 'alert', 'setMessages', 1)	

// 			messageToRelevantChatNodeOnIndividualScreen(room_string, this)
// 			.then((messages) => {

// 				// let messages_with_dummmy = [{text:'dummy message'}, ...messages]
// 				// console.log('messages_with_dummmy IS BELOW')
// 				// console.log(messages_with_dummmy)

// 				my_logger( 'messages', JSON.stringify(messages), 'value', 'setMessages' , 0)
// 				// console.log('messages ONLY IS BELOW')
// 				// console.log(JSON.stringify(messages))

// 				// MESSAGES ARE NOT BEING STORED WITH MESSAGE STRUCTURE

// 				// this.setState( prev => ({...prev, messages: prev.messages}) )
// 				my_logger('this.setState', {arg_passed:'messages'}, 'alert', 'setMessages', 1)	
// 			// OLD
// 				// this.setState( prev => ({...prev, messages: messages}) )
// 			// NEW
// 				this.props.set_messages(messages)
// 				// console.log('ROOM STRING IS BELOW')
// 				my_logger( 'room_string' ,room_string, 'value', 'setMessages' , 0)
// 				// console.log(room_string)
// 				// console.log('OWN NAME IS BELOW')
// 				my_logger('this.props.own_name', this.props.own_name, 'value', 'setMessages' , 0)
// 				// console.log(this.props.own_name)
// 				// console.log('OWN NUMBER IS BELOW')
// 				my_logger('this.props.own_number', this.props.own_number, 'value', 'setMessages' , 0)
// 				// console.log(this.props.own_number)
// 				// console.log('all_messages IS BELOW')
// 				// console.log(this.props.all_messages)
// 				my_logger('this.props.current_chat_screen_room_string', this.props.current_chat_screen_room_string, 'value', 'setMessages' , 0)
// 				// console.log('this.props.current_chat_screen_room_string', this.props.current_chat_screen_room_string) // not logging !!!			
// 			})
// 			.catch((err1) => {
// 				my_logger('err1', err1, 'error', 'setMessages' , 0)
// 				// console.log('ERRRRRR000', err)
// 			})

// 			// messages
// 			// .then((messages) => {
// 			// 	this.setState( prev => ({...prev, messages: messages}) )
// 			// 	console.log('OWN NAME IS BELOW')
// 			// 	console.log(this.props.own_name)
// 			// 	console.log('OWN NUMBER IS BELOW')
// 			// 	console.log(this.props.own_number)
// 			// 	console.log('all_messages IS BELOW')
// 			// 	console.log(this.props.all_messages)
// 			// 	console.log('current_chat_screen_room_string IS BELOW')
// 			// 	console.log(this.props.current_chat_screen_room_string)
// 			// })
// 			// .catch((err) => console.log('ERRRRRR000', err))

// 		} catch (err2) {
// 			// console.log('Log::: -----------ERROR FOUND IN setMessages function in individual_chat_screen------------')
// 			// console.log(err2)
// 			my_logger('err2', err2, 'value', 'setMessages' , 0)
// 		}

// 	}
// 	set_message_alignment(item){

// 		let alignment = 'right'
// 		// // let wrong_items_seen_through_log = [ '[', ']', 'undefined', undefined ]

// 		// if ( typeof item === undefined ){
// 		// 	console.log('==============ITS UNDEFINED=================')
// 		// 	alignment = 'right'

// 		// } else {
// 		// 	console.log('------------------------ ITS UNDEFINED ---------------------')

// 		// 	let matches = item.senders_details.match( /\d+(?=\+)/ )
// 		// 	if (matches.length > 0){
// 		// 		alignment = ( matches[0] === String(this.props.own_number) ) ? 'left' : 'right'
// 		// 	}

// 		// }

// 		if ( item.senders_details != undefined && item.senders_details.match( /\d+(?=\+)/ ) ){
// 			let matches = item.senders_details.match( /\d+(?=\+)/ )
// 			alignment = ( matches[0] === String(this.props.own_number) ) ? 'right' : 'left'
// 		}

// 		return alignment
// 	}


// 	sendMessage(){

// 		// console.log('ENTEREED 1')

// 		let message = this.state.message_being_typed

// 		var currentDate = new Date().toLocaleDateString("en-US").split("/").join(" | ");
// 		var currentTime = new Date().toLocaleTimeString("en-US").split("/").join(" | ");

// 		let room_string = this.props.current_chat_screen_room_string
// 		room_string = generate_proper_room_string(room_string)
// 		// let number1_pattern = /\d+(?=\-)/
// 		// let number1 = room_string.match( number1_pattern )

// 		// let number2_pattern = /\d+(?=\+)/
// 		// let number2 = room_string.match( number2_pattern )

// 		// room_string = ( Number(number1) < Number(number2) ) ? `${number1}-${number2}+` : `${number2}-${number1}+`

// 		// console.log('ENTEREED 2')
// 		// console.log('room string in indivdual screen is below')
// 		// console.log(this.props.current_chat_screen_room_string)

// 		message = {
// 			text: message, 
// 			room_string: room_string,
// 			message_state:  ( this.props.is_internet_connected ) ? 'sent' : 'offline_sent',
// 			sent_time: `${currentTime}_${currentDate}`,
// 			senders_details: `${this.props.own_name}-${this.props.own_number}+`,
// 			socketID:{local: this.props.socket_id},
// 		}
// 		// console.log('ENTEREED 3')
		
// 		// console.log('message in sendMessage REACT')
// 		// console.log(message)

// 		eventEmitter.emit('new_entry_in_message', this, message)

// 		// console.log('ENTEREED 4')
// 		// this.setState( prev => ({...prev, messages: [...prev.messages, ...this.props.new_messages_of_current_room]}) ) // I THINK THIS IS DOUBING IT
// 		// this.setState( prev => ({...prev, messages: [...prev.messages, message, ...this.props.new_messages_of_current_room]}) ) // REMOVED message as it was being doubled
// 	// OLD
// 		// this.setState( prev => ({...prev, messages: [
// 		// 	...prev.messages, 
// 		// 	...this.props.new_messages_of_current_room, // for recieving messages from others 
// 		// 	message
// 		// ]}) ) // I THINK THIS IS DOUBING IT
// 	// NEW
// 	// EVEN NEW IS REJECTED SINCE ITS DOUBLING
// 		// this.props.add_to_messages(...this.props.new_messages_of_current_room, message)
// 		// this.props.add_to_messages(message)
// 	}

// 	render() {
// 		return(
// 			<KeyboardAwareScrollView>
// 				<View style={styles.screenContainer}>
// 					<FlatList // message at either left or right, check number if mine then to right, 
// 						snapToInterval={100} // set it to height of component
// 						data={ this.props.messages }
// 						renderItem={
// 							({ item }) => {

// 								if (this.set_message_alignment(item) === 'left'){

// 									return(
										
// 										<View style={{width:'100%'}}>
// 											<View style={{
// 												flex:1,
// 												height: windowHeight * 0.1, // or 100
// 												justifyContent: 'center', // vertically centered
// 												alignSelf: 'flex-start', // horizontally centered
// 											}}>
// 												<Image 
// 													source={{uri: "data:image/jpeg;base64," + this.props.own_avatar}} 
// 													style={{...styles.imageStyle, width:70, height:70}}
// 												/>
// 											</View>
											
// 											<View style={{
// 												flex:4,
// 											}}>
// 												<Text style={{
// 													width:'100%',
// 													textAlign: 'left',
// 												}}>
// 													{item.text}
// 												</Text>
// 											</View>
// 										</View>

// 									)

// 								} else {

// 									return(

// 										<View style={{width:'100%', flexDirection:'row'}}>
											
// 											<View style={{
// 												flex:4,
// 											}}>
// 												<Text style={{
// 													width:'100%',
// 													textAlign: 'right',
// 												}}>
// 													{item.text}
// 												</Text>
// 											</View>

// 											<View style={{
// 												flex:1,
// 												height: windowHeight * 0.1, // or 100
// 												justifyContent: 'center', // vertically centered
// 												alignSelf: 'flex-start', // horizontally centered
// 											}}>
// 												<Image 
// 													source={{uri: "data:image/jpeg;base64," + this.props.recipents_avatar}} 
// 													style={{...styles.imageStyle, width:70, height:70}}
// 												/>
// 											</View>
// 										</View>

// 									)

// 								}
// 							}
// 						}
// 						keyExtractor={() => `${Math.floor(Math.random() * 100)}-${Math.random().toString(36).substring(7)}`}
// 						ref = {"flatList"}
// 						onContentSizeChange={()=> this.refs.flatList.scrollToEnd()}
// 					/>
// 				</View>

// 				{
// 					this.state.localStream &&
// 					<RTCView
// 						streamURL={this.state.localStream.toURL()}
// 						style={{width:200, height:200}} 
// 					/>
// 				}

// 				{this.props.videocall_incoming && 
// 					<Button onPress={() => {}}>
// 						Accept Call
// 					</Button>
// 				}

// 				<Text>
// 					remoteStreams:{this.state.remoteStreams}
// 				</Text>

// 				<Text>
// 					remoteStream:{this.state.remoteStream}
// 				</Text>


// 				{this.state.remoteStreams.length > 0 && <VIEW>
// 					<Text>
// 						Video Call Available
// 					</Text>		
// 				</VIEW>
// 			}

// 				{
// 					this.state.remoteStreams.length > 0 &&
// 					this.state.remoteStreams.map((video_stream, index) => {
// 						console.log('VIDEO STREAM')
// 						{/*console.log(video_stream)*/}
// 						{/*console.log(video_stream.stream.toURL())*/}
// 						{/*console.log(video_stream.stream._tracks)*/}
// 						console.log('this.props.selectedVideo')
// 						console.log(this.state.selectedVideo)


// 						{/*this.setState(prev => ({...prev, stream: video_stream.stream}))*/}
						
// 						{/*if (index < 3){*/}
// 							return(
// 								<RTCView
// 									objectFit='cover'
// 									key={1}
// 							      zOrder={2}
// 									// console.log('VIDEO AVAILABLE')
// 									// streamURL={video_stream.stream.toURL()}
// 									// streamURL={video_stream.stream.toURL()}
// 									// streamURL={(this.state.stream !== null) ? this.state.stream.toURL() : null}
// 									// streamURL={this.props.selectedVideo}
// 									streamURL={this.state.selectedVideo.stream.toURL()}
// 									style={{width:200, height:200}} 
// 								/>
// 							)
// 						{/*}*/}
// 					})

// 				}


// 				<TouchableHighlight activeOpacity={0.2} onPress={() => {
// 					console.log(`socket id ${this.props.live_socket.id}`)
// 					// console.log(this.props.live_socket.id)
// 					makeVideoCall(this, this.props.current_chat_screen_room_string)
// 				}} style={styles.buttonWithoutBG}>
// 					<Text style={styles.innerText}>
// 						Make Video Call
// 					</Text>
// 				</TouchableHighlight>
				

// 				<View style={styles.textinputContainer}>
// 					<TextInput
// 						style={styles.textinput}
// 						placeholder="Type A Message"
// 						placeholderTextColor = {utils.lightGrey}
// 						// maxLength=10
// 						// caretHidden=true
// 						// multiline=true
// 						// numberOfLines=3
// 						// value='dummy'
// 						// autoFocus=true
// 						onChangeText={ (text) => this.setState(prev => ({...prev, message_being_typed: text})) }
// 					/>
					
// 					<View style={styles.buttonContainer}>
// 						<TouchableOpacity style={styles.roundButton} activeOpacity={0.2}
// 							onPress={() => { this.sendMessage() }} 
// 						>
// 							<Text style={styles.text}>
// 								SEND
// 							</Text>
// 						</TouchableOpacity>
// 					</View>
					
// 				</View>				
// 			</KeyboardAwareScrollView>
// 		);
// 	}
// }

// const styles = StyleSheet.create({
// 	screenContainer:{
// 		width: windowWidth,
// 		height: windowHeight * 0.74
// 	},
// 	textinputContainer:{

// 		flexDirection: 'row',
// 		// marginTop: windowHeight * 0.05, // or 30  gap
// 		height: windowHeight * 0.1, // or 100
// 		width: '100%',
// 		justifyContent: 'center', // vertically centered
// 		alignSelf: 'center', // horizontally centered
// 		// backgroundColor: utils.lightGreen,
// 	},
// 	textinput:{
// 		flex:4,
// 		marginTop:20,
// 		textAlign:'left',
// 		borderWidth:1,
// 		borderColor:(utils.lightGrey),
// 		borderStyle:'solid',
// 		paddingLeft:20,
// 		paddingTop:15,
// 		paddingBottom:15,
// 		fontSize:18,
// 	},
// 	buttonContainer:{
// 		flex:1,
// 		// position:'relative',
// 		// top: windowHeight * 0.6,
// 		// display:'flex',
// 		flexDirection:'row',
// 		justifyContent: 'center',
// 		alignItems:'center', 
// 		height:100,
// 	},
// 	roundButton:{
// 		// borderRadius:10,
// 		// borderColor:'green',
// 		// borderWidth:2,
// 		backgroundColor: 'blue',
// 		// borderStyle:'solid',
	
// 		paddingLeft:5,
// 		paddingRight:5,
// 		paddingTop:10,
// 		paddingBottom:20,
// 	},
// 	text:{
// 		fontSize:20,
// 		color:'white',
// 		textAlign:'center',
// 	},

// 	buttonWithoutBG:{
// 		marginTop:5,
// 		marginBottom:5,
// 	},
// 	innerText:{
	
// 	},


// })