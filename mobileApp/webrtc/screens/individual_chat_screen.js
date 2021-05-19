import React, {Component} from 'react';
// IMPORT classes to use
import { 
	FlatList,
	TextInput,
	ImageBackground,
	View,
	StyleSheet, 
	// Button,
	Text,
	TouchableOpacity,
	// TouchableHighlight,
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
 } from "../handy_functions/RTC_video_conference_call_functions"

import {eventEmitter} from '../handy_functions/events_management'

export default class IndividualChatScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// messages:this.props.all_messages,
			// messages:messageToRelevantChatNodeOnIndividualScreen(this.props.current_chat_screen_room_string),
			// messages:[],
			message_being_typed:'',
		}
	}

	componentDidMount(){

		
		my_logger( null, null, 'function_entering', 'componentDidMount' , 0)
		
		 // dont forget to try catch wrap entire function
		
		

		// console.log(phone_number)

	// COLLECTING OLD MESSAGES AND SHOWING 
		const { phone_number } = this.props.route.params;

		let room_string = ( Number(phone_number) < Number(this.props.own_number) ) ? `${phone_number}-${this.props.own_number}+` : `${this.props.own_number}-${phone_number}+`
		// let room_string = `${phone_number}-${this.props.own_number}`
		// my_logger('this.props.set_current_room_string', {arg_passed:'room_string', arg:room_string}, 'alert', 'componentDidMount', 1)	
		console.log('current chat room string')
		console.log(this.props.current_chat_screen_room_string)

		this.props.set_current_room_string(room_string)

		console.log('switch chat room string')
		console.log(this.props.current_chat_screen_room_string)
		my_logger('this.setMessages', {arg_passed:'room_string', arg:room_string}, 'alert', 'componentDidMount', 1)	

		this.setMessages(room_string)

	// LISTENING FOR NEW MESSAGES AND SHOWING
		

		
		my_logger( null, null, 'function_exiting', 'componentDidMount' , 0)
				
		axios.post(utils.baseURL + '/rooms/create-room', {room_string:room_string})
		.then(function (response) {
			console.log(JSON.stringify(response.data));
		})
		.catch(function (error) {
			console.log(error);
		});
				
	}

	componentWillUnmount(){


		
		my_logger( null, null, 'function_entering', 'componentWillUnmount' , 0)
		
		 // dont forget to try catch wrap entire function
		
		
		my_logger('this.props.clear_all_previous_new_messages_of_old_room', {arg_passed:'none', arg:'none'}, 'alert', 'componentWillUnmount', 1)	
		this.props.clear_all_previous_new_messages_of_old_room()	


		
		my_logger( null, null, 'function_exiting', 'componentWillUnmount' , 0)
		
		 // dont forget to try catch wrap entire function
		
		
	}

	async setMessages(room_string){

		
		my_logger( null, null, 'function_entering', 'setMessages' , 0)
		
		 // dont forget to try catch wrap entire function
		
				
		// console.log('ss OWN NAME IS BELOW')
		
		 // dont forget to try catch wrap entire function
		
		

		// let messages = await messageToRelevantChatNodeOnIndividualScreen(room_string)

		try{
			my_logger('messageToRelevantChatNodeOnIndividualScreen', {arg_passed:'room_string, this', args:[room_string, 'this']}, 'alert', 'setMessages', 1)	

			messageToRelevantChatNodeOnIndividualScreen(room_string, this)
			.then((messages) => {

				// let messages_with_dummmy = [{text:'dummy message'}, ...messages]
				// console.log('messages_with_dummmy IS BELOW')
				// console.log(messages_with_dummmy)

				my_logger( 'messages', JSON.stringify(messages), 'value', 'setMessages' , 0)
				// console.log('messages ONLY IS BELOW')
				// console.log(JSON.stringify(messages))

				// MESSAGES ARE NOT BEING STORED WITH MESSAGE STRUCTURE

				// this.setState( prev => ({...prev, messages: prev.messages}) )
				my_logger('this.setState', {arg_passed:'messages'}, 'alert', 'setMessages', 1)	
			// OLD
				// this.setState( prev => ({...prev, messages: messages}) )
			// NEW
				this.props.set_messages(messages)
				// console.log('ROOM STRING IS BELOW')
				my_logger( 'room_string' ,room_string, 'value', 'setMessages' , 0)
				// console.log(room_string)
				// console.log('OWN NAME IS BELOW')
				my_logger('this.props.own_name', this.props.own_name, 'value', 'setMessages' , 0)
				// console.log(this.props.own_name)
				// console.log('OWN NUMBER IS BELOW')
				my_logger('this.props.own_number', this.props.own_number, 'value', 'setMessages' , 0)
				// console.log(this.props.own_number)
				// console.log('all_messages IS BELOW')
				// console.log(this.props.all_messages)
				my_logger('this.props.current_chat_screen_room_string', this.props.current_chat_screen_room_string, 'value', 'setMessages' , 0)
				// console.log('this.props.current_chat_screen_room_string', this.props.current_chat_screen_room_string) // not logging !!!			
			})
			.catch((err1) => {
				my_logger('err1', err1, 'error', 'setMessages' , 0)
				// console.log('ERRRRRR000', err)
			})


			// messages
			// .then((messages) => {
			// 	this.setState( prev => ({...prev, messages: messages}) )
			// 	console.log('OWN NAME IS BELOW')
			// 	console.log(this.props.own_name)
			// 	console.log('OWN NUMBER IS BELOW')
			// 	console.log(this.props.own_number)
			// 	console.log('all_messages IS BELOW')
			// 	console.log(this.props.all_messages)
			// 	console.log('current_chat_screen_room_string IS BELOW')
			// 	console.log(this.props.current_chat_screen_room_string)
			// })
			// .catch((err) => console.log('ERRRRRR000', err))

		} catch (err2) {
			// console.log('Log::: -----------ERROR FOUND IN setMessages function in individual_chat_screen------------')
			// console.log(err2)
			my_logger('err2', err2, 'value', 'setMessages' , 0)
		}

	}
	set_message_alignment(item){

		let alignment = 'right'
		// // let wrong_items_seen_through_log = [ '[', ']', 'undefined', undefined ]

		// if ( typeof item === undefined ){
		// 	console.log('==============ITS UNDEFINED=================')
		// 	alignment = 'right'

		// } else {
		// 	console.log('------------------------ ITS UNDEFINED ---------------------')

		// 	let matches = item.senders_details.match( /\d+(?=\+)/ )
		// 	if (matches.length > 0){
		// 		alignment = ( matches[0] === String(this.props.own_number) ) ? 'left' : 'right'
		// 	}

		// }

		if ( item.senders_details != undefined && item.senders_details.match( /\d+(?=\+)/ ) ){
			let matches = item.senders_details.match( /\d+(?=\+)/ )
			alignment = ( matches[0] === String(this.props.own_number) ) ? 'right' : 'left'
		}

		return alignment
	}

	sendMessage(){

		console.log('ENTEREED 1')

		let message = this.state.message_being_typed

		var currentDate = new Date().toLocaleDateString("en-US").split("/").join(" | ");
		var currentTime = new Date().toLocaleTimeString("en-US").split("/").join(" | ");

		let room_string = this.props.current_chat_screen_room_string
		room_string = generate_proper_room_string(room_string)
		// let number1_pattern = /\d+(?=\-)/
		// let number1 = room_string.match( number1_pattern )

		// let number2_pattern = /\d+(?=\+)/
		// let number2 = room_string.match( number2_pattern )

		// room_string = ( Number(number1) < Number(number2) ) ? `${number1}-${number2}+` : `${number2}-${number1}+`

		console.log('ENTEREED 2')
		console.log('room string in indivdual screen is below')
		console.log(this.props.current_chat_screen_room_string)

		message = {
			text: message, 
			room_string: room_string,
			message_state:  ( this.props.is_internet_connected ) ? 'sent' : 'offline_sent',
			sent_time: `${currentTime}_${currentDate}`,
			senders_details: `${this.props.own_name}-${this.props.own_number}+`,
			socketID:{local: this.props.socket_id}
		}
		console.log('ENTEREED 3')
		
		eventEmitter.emit('new_entry_in_message', this, message)

		console.log('ENTEREED 4')
		// this.setState( prev => ({...prev, messages: [...prev.messages, ...this.props.new_messages_of_current_room]}) ) // I THINK THIS IS DOUBING IT
		// this.setState( prev => ({...prev, messages: [...prev.messages, message, ...this.props.new_messages_of_current_room]}) ) // REMOVED message as it was being doubled
	// OLD
		// this.setState( prev => ({...prev, messages: [
		// 	...prev.messages, 
		// 	...this.props.new_messages_of_current_room, // for recieving messages from others 
		// 	message
		// ]}) ) // I THINK THIS IS DOUBING IT
	// NEW
	// EVEN NEW IS REJECTED SINCE ITS DOUBLING
		// this.props.add_to_messages(...this.props.new_messages_of_current_room, message)
		// this.props.add_to_messages(message)
	}

	render() {
		return(
			<KeyboardAwareScrollView>
				<View style={styles.screenContainer}>
					<FlatList // message at either left or right, check number if mine then to right, 
						snapToInterval={100} // set it to height of component
						// data={(this.state.messages.length > 2) ? this.state.messages : [{text:'dummy message'}]} // length > 2 because by default 2 is length of messages
						// data={ [{text:'dummy message'}] }
					// OLD
						// data={ this.state.messages }
					// NEW
						data={ this.props.messages }
						renderItem={
							({ item }) => (
								<View style={{width:'100%'}}>
									<Text 
										style={{
											width:'100%',
											textAlign: this.set_message_alignment(item),
									}}>
										{/*JSON.stringify(item)*/}
										{item.text}
									</Text>
								</View>
							)
						}
						keyExtractor={() => `${Math.floor(Math.random() * 100)}-${Math.random().toString(36).substring(7)}`}
						ref = {"flatList"}
						onContentSizeChange={()=> this.refs.flatList.scrollToEnd()}
					/>
				</View>

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
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	screenContainer:{
		width: windowWidth,
		height: windowHeight * 0.78
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

})