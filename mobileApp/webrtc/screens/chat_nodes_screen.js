import React, {Component} from 'react';
// IMPORT classes to use
import { 
	Image,
	FlatList,
	ScrollView,
	ImageBackground,
	View,
	StyleSheet, 
	// Button,
	Text,
	TouchableOpacity,
	TextInput,
	Modal,
	// TouchableHighlight,
} from "react-native";
// IMPORT components without store / redux
import {

} from "../components";
// IMPORT connected components
// import {ConnectedSomeComponent} from "../redux_stuff/connected_components";

import { Icon } from 'react-native-elements';
	
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

import utils from "../utilities";

import {
	check_permission_and_save_contact,
	show_all_contacts_and_set_in_state,
} from "../handy_functions/contacts_functions"

import {
	goOnline,
	messageCountAndLastMessageToRelevantChatNode,
} from "../handy_functions/RTC_video_conference_call_functions"

const eventEmitter = require('../handy_functions/events_management')

const { my_logger } = require('../handy_functions/my_custom_logger')

export default class ChatNodesScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			show_select_contact_modal: false,
			show_save_contact_modal: false,
			show_plus_button_options: false,
			user_name:'',
			user_phone_number:'',

			// chat_nodes:[],
		}
	}


	componentDidMount(){

		if (this.props.is_internet_connected === true){
			console.log('--------------INTERNET CONNECTED-----------------')
			goOnline(this)
		}

	}

	componentDidUpdate(prevProps, prevState, snapshot){
		// // // Typical usage (don't forget to compare states) BUT STATE IS THROUGH props IN REDUX
		// // if (this.props.contacts !== prevProps.contacts) {
		// // 	show_all_contacts_and_set_in_state()
		// // 	console.log("--------LOG--------")
		// // 	console.log( this.props.contacts )
		// // }
		// if ( this.props.is_internet_connected === false &&  prevProps.is_internet_connected === true){
		// 	console.log('FROM this.props.is_internet_connected === false &&  prevProps.is_internet_connected === true')
		// 	// console.log("Connection type", state.type);
		// 	console.log("Is connected?", this.props.is_internet_connected);
		// 	// goOnline(this)
		// 	// goOnline(this)
		// }
		

		// if ( this.props.is_internet_connected === true ){
		// 	console.log('FROM this.props.is_internet_connected === true')
		// 	// console.log("Connection type", state.type);
		// 	console.log("Is connected?", this.props.is_internet_connected);
		// 	// goOnline(this)
		// 	// goOnline(this)
		// }


		// if ( this.props.is_internet_connected === true &&  prevProps.is_internet_connected === false){
		// 	console.log('FROM this.props.is_internet_connected === true &&  prevProps.is_internet_connected === false')
		// 	// console.log("Connection type", state.type);
		// 	console.log("Is connected?", this.props.is_internet_connected);
		// 	// goOnline(this)
		// 	// goOnline(this)
		// }

	}


	toggle_show_plus_button_options(){

		my_logger(null, null, 'function_entering', 'toggle_show_plus_button_options', 0)
	
		try{

			my_logger('this.setState', {arg_passed:'show_plus_button_options'}, 'alert', 'toggle_show_plus_button_options', 1)	
			this.setState(prev => ({...prev, show_plus_button_options: (prev.show_plus_button_options === true) ? false : true }))
			
			// my_logger(returned_value, 'function_returning', 'toggle_show_plus_button_options', 0)
			// return 
	
		} catch (err) {
	
			my_logger('err', err, 'error', 'toggle_show_plus_button_options', 0)
	
		}
	
		my_logger(null, null, 'function_exiting', 'toggle_show_plus_button_options', 0)
		
	}

	toggle_save_contact_modal(){
	
		my_logger(null, null, 'function_entering', 'toggle_save_contact_modal', 0)
	
		try{
			
			my_logger('this.setState', {arg_passed:'show_save_contact_modal'}, 'alert', 'toggle_save_contact_modal', 1)	
			this.setState(prev => ({...prev, show_save_contact_modal: (prev.show_save_contact_modal === false) ? true : false }))
			
			// my_logger(returned_value, 'function_returning', 'toggle_save_contact_modal', 0)
			// return 
	
		} catch (err) {
	
			my_logger('err', err, 'error', 'toggle_save_contact_modal', 0)
	
	
		}
	
		my_logger(null, null, 'function_exiting', 'toggle_save_contact_modal', 0)

	}

	toggle_select_contact_modal(){
	
		my_logger(null, null, 'function_entering', 'toggle_select_contact_modal', 0)
	
		try{
			
			my_logger('this.setState', {arg_passed:'show_select_contact_modal'}, 'alert', 'toggle_select_contact_modal', 1)	
			this.setState(prev => ({...prev, show_select_contact_modal: (prev.show_select_contact_modal === false) ? true : false }))

			show_all_contacts_and_set_in_state(this)
	
			// my_logger(returned_value, 'function_returning', 'toggle_select_contact_modal', 0)
			// return 
	
		} catch (err) {
	
			my_logger('err', err, 'error', 'toggle_select_contact_modal', 0)
	
	
		}
	
		my_logger(null, null, 'function_exiting', 'toggle_select_contact_modal', 0)

	}

	save_contact_to_contacts(){
	
		my_logger(null, null, 'function_entering', 'save_contact_to_contacts', 0)
	
		try{

			my_logger('check_permission_and_save_contact', {arg_passed:'[this, this.state.user_name, this.state.user_phone_number]', args:[this, this.state.user_name, this.state.user_phone_number]}, 'alert', 'save_contact_to_contacts', 1)	
			check_permission_and_save_contact(this, this.state.user_name, this.state.user_phone_number)
			
			// my_logger(returned_value, 'function_returning', 'save_contact_to_contacts', 0)
			// return 
	
		} catch (err) {
	
			my_logger('err', err, 'error', 'save_contact_to_contacts', 0)
	
	
		}
	
		my_logger(null, null, 'function_exiting', 'save_contact_to_contacts', 0)

	}

	// createChatNodeIfNotExists(room_string, phone_number, display_name, display_picture){
	createChatNodeIfNotExists(room_string, phone_number, display_name){ // removed display picture temporarily
	}	

	generateRoomString(users_phone_number){
	
		my_logger(null, null, 'function_entering', 'generateRoomString', 0)
	
		try{
	
			
			let number1 = this.props.own_number
			let number2 = users_phone_number

			let room_string = ( Number(number1) < Number(number2) ) ? `${number1}-${number2}+` : `${number2}-${number1}+`

			console.log('room_string generated in generateRoomString REACT')
			console.log(room_string)
	
			my_logger(room_string, 'function_returning', 'generateRoomString', 0)
			return room_string
	
		} catch (err) {
	
			my_logger('err', err, 'error', 'generateRoomString', 0)
	
	
		}
	
		my_logger(null, null, 'function_exiting', 'generateRoomString', 0)
		
	}

	render() {
		const renderPlusButtonOptions =	(this.state.show_plus_button_options) 
			? 
				( 	
					<React.Fragment>			
						<TouchableOpacity activeOpacity={0.2} onPress={() => this.toggle_save_contact_modal()} 
							style={{
								marginTop:50,
								marginBottom:50,
								position:'absolute',
								top: windowHeight * 0.72,
								left: windowWidth * 0.35,
								justifyContent: 'center',
								alignItems:'center', 
								height:40,
								backgroundColor: 'green',
								borderColor:'green',
								borderRadius:100,
								borderWidth:2,
								// backgroundColor: 'green',
								borderStyle:'solid',
								paddingHorizontal: 5,
							}}
						>
							<Text style={styles.modalButtonText}>
								Add Contact
							</Text>
						</TouchableOpacity>

						<TouchableOpacity activeOpacity={0.2} onPress={() => this.toggle_select_contact_modal()} 
							style={{
								marginTop:50,
								marginBottom:50,
								position:'absolute',
								top: windowHeight * 0.62,
								left: windowWidth * 0.32,
								justifyContent: 'center',
								alignItems:'center', 
								height:40,
								backgroundColor: 'green',
								borderColor:'green',
								borderRadius:100,
								borderWidth:2,
								backgroundColor: 'green',
								borderStyle:'solid',
								paddingHorizontal: 5,
							}}
						>
							<Text style={styles.modalButtonText}>
								Send Message
							</Text>
						</TouchableOpacity>
					</React.Fragment>
				)
			:
				(
					null
				)

		return (

			// <ScrollView contentContainerStyle={styles.screenContainer}>
			<View>
				<FlatList
					snapToInterval={100} // set it to height of component
					data={ this.props.all_chatnodes } // create DATA as list of objects
					renderItem={
						({ item }) => {
							console.log('item')
							console.log(item)
							return(							
								<TouchableOpacity activeOpacity={0.2} 
									style={{height:windowHeight * 0.3}}
									onPress={() => {

										this.props.set_current_room_string(item.room_string)
										
										console.log('item.phone_number is below')
										console.log(item.phone_number)
										// this.props.navigation.navigate('IndividualChat', {phone_number: item.phoneNumbers[0].number})
										let number_pattern1 = /\d+(?=\-)/
										let phone_number1 = item.room_string.match( number_pattern1 )
										phone_number1 = phone_number1[0]

										let number_pattern2 = /\d+(?=\+)/
										let phone_number2 = item.room_string.match( number_pattern2 )
										phone_number2 = phone_number2[0]

										console.log({phone_number1:phone_number1, phone_number2:phone_number2})

										let other_persons_number

										other_persons_number = (this.props.own_number === phone_number1) ? phone_number2 : phone_number1 

										console.log('other_persons_number')
										console.log(other_persons_number)

										console.log('this.props.own_number')
										console.log(this.props.own_number)


										this.props.navigation.push(
											'IndividualChat', 
											{phone_number: other_persons_number}
										)
									}}
								> 		
									<View>
										<Text>
											{item.display_name}
										</Text>
										<Text>
											{item.phone_number}
										</Text>
										<Text>
											{item.count}
										</Text>
										<Text>
											
										</Text>
									</View>
								</TouchableOpacity>
							) //   {messageCountAndLastMessageToRelevantChatNode(this, item.room_string).count}
						}
					} // {messageCountAndLastMessageToRelevantChatNode(this, item.room_string).last_message}
					keyExtractor={item => String( Math.floor(Math.random() * 100) )}
				/>	
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.roundButton} onPress={() => this.toggle_show_plus_button_options()} activeOpacity={0.2}>
						<Text style={styles.text}>
							+
						</Text>
					</TouchableOpacity>
				</View>
					
				{renderPlusButtonOptions}

{/* --------- modal for creating new contact starts here ------------------*/}
				<Modal				  	
					animationType={"slide"}
					transparent={false}
					visible={this.state.show_save_contact_modal} // link some variable to it so that it could be turned off
					// presentationStyle={'formSheet'}
					// onRequestClose={() => {Alert.alert("Modal has been closed.");}}
				>
					<View style={{
						height:windowHeight, 
					}}>

						<TouchableOpacity activeOpacity={0.2} onPress={() => this.toggle_save_contact_modal()} style={{height:windowHeight * 0.3}}>
						</TouchableOpacity>
						
						<View style={{backgroundColor: 'blue'}}>
							<View style={styles.textinputContainer}>
								<Text style={styles.modalText}>Display Name</Text>
								<TextInput
									style={styles.textinput}
									placeholder="Enter Display Name of Contact"
									placeholderTextColor = 'white'
									autoFocus={true}
									onChangeText={ (text1) => this.setState(prev => ({...prev, user_name: text1})) }
								/>
							</View>

							<View style={styles.textinputContainer}>
								<Text style={styles.modalText}>Phone Number</Text>
								<TextInput
									style={styles.textinput}
									placeholder="Enter Phone Number of Contact"
									placeholderTextColor = 'white'
									autoFocus={true}
									onChangeText={ (text2) => this.setState(prev => ({...prev, user_phone_number: text2})) }
								/>
							</View>
						</View>

						<TouchableOpacity activeOpacity={0.2} style={styles.saveButton}
							onPress={() => this.save_contact_to_contacts()}
						>
							<Text style={styles.innerText}>
								Save Contact
							</Text>
						</TouchableOpacity>
					

						<TouchableOpacity activeOpacity={0.2} onPress={() => this.toggle_save_contact_modal()} style={{height:windowHeight * 0.3}}>
						</TouchableOpacity>
					</View>
				</Modal>
{/* --------- modal for creating new contact ends here ------------------*/}




{/* --------- modal for selecting contact for messaging starts here ------------------*/}
				<Modal
					animationType={"slide"}
					transparent={false}
					visible={this.state.show_select_contact_modal} // link some variable to it so that it could be turned off
					// presentationStyle={'formSheet'}
					// onRequestClose={() => {Alert.alert("Modal has been closed.");}}
				>
					<View style={{ height: windowHeight }}>
						<FlatList
							snapToInterval={100} // set it to height of component
							data={ this.props.contacts } // create DATA as list of objects
							renderItem={
								({ item }) => (
									(item.phoneNumbers.length > 0) 
									?
										(
										<TouchableOpacity activeOpacity={0.2}
											// onPress = { () => console.log('called')} 
											onPress={
												() => {
													console.log('called')
													this.createChatNodeIfNotExists(
														this.generateRoomString(item.phoneNumbers[0].number), 
														item.phoneNumbers[0].number, 
														item.displayName, 
														// display_picture
													)
													
													this.toggle_select_contact_modal()

													this.props.navigation.push(
														'IndividualChat', 
														{phone_number: item.phoneNumbers[0].number}
													)

												
												// this.props.set_current_room_string(`${this.props.own_number}-${item.phoneNumbers[0].number}`)
										}}>
											<View style={styles.contactContainer}>
												<View style={styles.imageContainer}>
													<Image source={utils.dpImagePlaceholder} style={styles.dpImageContainer}/>
												</View>
												
												<View style={styles.nameAndNumberContainer}>
													<Text style={styles.displayName}>
														{item.displayName}
													</Text>

													<Text style={styles.phoneNumber}>
														{item.phoneNumbers[0].number}
													</Text>
												</View>
											</View>
										</TouchableOpacity>
										)
									:
										null
								)
							}
							keyExtractor={item => item.id}
						/>
					</View>
				</Modal>

{/* --------- modal for selecting contact for messaging ends here ------------------*/}
			</View>
			// </ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	screenContainer:{
		flex:1,
		// display:'flex',
		alignItems: 'center', // horizontally centered
		justifyContent: 'space-between',
		// backgroundColor: '#000000' 
	},
	somethingContainer:{
		marginTop: windowHeight * 0.05, // or 30  gap
		height: windowHeight * 0.1, // or 100
		width: '80%',
		justifyContent: 'center', // vertically centered
		alignSelf: 'center', // horizontally centered
		// backgroundColor: utils.lightGreen,
	},
	innerText:{
		textAlign: 'center',
		fontSize:20,
		color:'white',
	},
	saveButton:{
		backgroundColor: 'green',
		height:50,
		// alignItems:'center',
		justifyContent:'center',

	},
	modalText:{
		textAlign:'center',
		fontSize:18,
		fontWeight:'bold',
	},
	textinput:{
		textAlign:'center',
		color:'white',
	},
	buttonContainer:{
		position:'absolute',
		top: windowHeight * 0.7,
		left: windowWidth * 0.7,
		justifyContent: 'center',
		alignItems:'center', 
		height:80,
	},
	roundButton:{
		borderColor:'green',
		borderRadius:100,
		borderWidth:2,
		backgroundColor: 'green',
		borderStyle:'solid',
		height:80,
		width:80,
		justifyContent: 'center',
		alignItems: 'center', 
	},
	text:{
		fontSize:50,
		color:'white',
		textAlign:'center',
	},
	addContact:{
		marginTop:50,
		marginBottom:50,
		position:'absolute',
		top: windowHeight * 0.72,
		left: windowWidth * 0.35,
		justifyContent: 'center',
		alignItems:'center', 
		height:40,
		backgroundColor: 'green',
		borderColor:'green',
		borderRadius:100,
		borderWidth:2,
		backgroundColor: 'green',
		borderStyle:'solid',
		paddingHorizontal: 5,
	},
	selectContact:{
		marginTop:50,
		marginBottom:50,
		position:'absolute',
		top: windowHeight * 0.62,
		left: windowWidth * 0.32,
		justifyContent: 'center',
		alignItems:'center', 
		height:40,
		backgroundColor: 'green',
		borderColor:'green',
		borderRadius:100,
		borderWidth:2,
		backgroundColor: 'green',
		borderStyle:'solid',
		paddingHorizontal: 5,
	},
	modalButtonText:{
		textAlign:'center',
		color:'white',
		fontSize:20,

	},
	contactContainer:{
		paddingLeft:10,
		height:70,
		backgroundColor: '#eee',
		borderBottomColor:'white',
		borderBottomWidth: 1,
		borderStyle: 'solid',
		flexDirection: 'row',
		alignItems:'center',
		justifyContent: 'flex-start'

	},
	displayName:{
		fontSize:20,
		fontWeight:'bold',
	},
	phoneNumber:{
		fontSize:15,
	},
	dpImageContainer:{
		resizeMode: "contain", // "contain / center / cover / stretch / repeat"
		height: 50,
		width: 50,
		// borderWidth: 2,
		// borderRadius: 50,
		// borderColor: 'white',
		// borderStyle: 'solid', 
		backgroundColor: 'white',

	},
	imageContainer:{
		// marginTop: windowHeight * 0.05, // or 30  gap
		// height: windowHeight * 0.1, // or 100
		// width: '80%',
		flex:1,
		justifyContent: 'center', // vertically centered
		alignSelf: 'center', // horizontally centered
		// backgroundColor: utils.lightGreen,
	},
	nameAndNumberContainer:{
		flex:3
	}
});
















				// <Modal
				// 	animationType={"slide"}
				// 	transparent={false}
				// 	visible={this.state.show_select_contact_modal} // link some variable to it so that it could be turned off
				// 	// presentationStyle={'formSheet'}
				// 	// onRequestClose={() => {Alert.alert("Modal has been closed.");}}
				// >
				// 	<View style={{ height: windowHeight }}>
				// 		<ScrollView>
				// 			<View onStartShouldSetResponder={(): boolean => true}>
				// 				<FlatList
				// 					snapToInterval={100} // set it to height of component
				// 					data={this.props.contacts} // create DATA as list of objects
				// 					renderItem={
				// 						({ item } ) => (
				// 							(item.phoneNumbers.length > 0) 
				// 							?
				// 								(
				// 								<TouchableOpacity activeOpacity={0.2}
				// 									// onPress = { () => console.log('called')} 
				// 									onPress={
				// 										() => {this.props.navigation.navigate(
				// 										'IndividualChat', {phone_number: item.phoneNumbers[0].number})
														
				// 										this.props.set_current_room_string(`${this.props.own_number}-${item.phoneNumbers[0].number}`)
				// 								}}>
				// 									<View style={styles.contactContainer}>
				// 										<View style={styles.imageContainer}>
				// 											<Image source={utils.dpImagePlaceholder} style={styles.dpImageContainer}/>
				// 										</View>
														
				// 										<View style={styles.nameAndNumberContainer}>
				// 											<Text style={styles.displayName}>
				// 												{item.displayName}
				// 											</Text>

				// 											<Text style={styles.phoneNumber}>
				// 												{item.phoneNumbers[0].number}
				// 											</Text>
				// 										</View>
				// 									</View>
				// 								</TouchableOpacity>
				// 								)
				// 							:
				// 								null
				// 						)
				// 					}
				// 					keyExtractor={item => item.displayName}
				// 				/>
				// 			</View>
				// 		</ScrollView>
				// 	</View>
				// </Modal>
