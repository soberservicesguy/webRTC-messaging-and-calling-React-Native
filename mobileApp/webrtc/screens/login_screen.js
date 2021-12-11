import React, {Component} from 'react';
// IMPORT classes to use
import { 
	PermissionsAndroid,
	ImageBackground,
	View,
	StyleSheet, 
	Button,
	Text,
	TouchableOpacity,
	TextInput,
	// TouchableHighlight,
} from "react-native";

// IMPORT components without store / redux
import {

} from "../components";
// IMPORT connected components
// import {ConnectedSomeComponent} from "../redux_stuff/connected_components";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Icon } from 'react-native-elements';
import axios from 'axios';

import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const { my_logger } = require('../handy_functions/my_custom_logger')

import DocumentPicker from 'react-native-document-picker';


import utils from "../utilities";

import { 
	setObjectValue,
	set_messages_as_empty_array,
	set_offline_messages_as_empty_array,
	set_chatnodes_as_empty_array,
} from "../handy_functions/asyncstorage_function"


const { DebuggerStuff } = require('../handy_functions/debugger')
var execute_function_and_debug = new DebuggerStuff()
var logging_list = execute_function_and_debug.logging_list



import {
	contacts_read_and_write_permission,
} from "../handy_functions/permissions_functions"






export default class LoginScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			phone_number: '',
			user_name:'',
			user_image: null,
		}
	}

	componentDidMount(){
		// const my_logger = require('./handy_functions/my_custom_logger')
		
		my_logger( 'null', null, 'function_entering', 'componentDidMount' )
		
		 // dont forget to try catch wrap entire function
		
		
		set_messages_as_empty_array() // DANGEROUS, THIS DELETES ALL PREVIOUS MESSAGES
		set_offline_messages_as_empty_array() // DANGEROUS, THIS DELETES ALL PREVIOUS MESSAGES
		set_chatnodes_as_empty_array() // DANGEROUS, THIS DELETES ALL PREVIOUS MESSAGES

		contacts_read_and_write_permission(this)
	}


	storeNameAndNumber(){

		my_logger( 'null', null, 'function_entering', 'storeNameAndNumber' )
		
		try{
	
			setObjectValue(
				'user_details', 
				{user_name: this.state.user_name, phone_number: this.state.phone_number}
			)
			this.props.set_own_number(this.state.phone_number)
			this.props.set_own_name(this.state.user_name)
			
	
			// my_logger(returned_value, 'function_returning', 'storeNameAndNumber')
	
		} catch (err) {
	
			my_logger('err', err, 'error', 'storeNameAndNumber' )
	
		}
	
		my_logger( 'null', null, 'function_exiting', 'storeNameAndNumber' )
	
	}

	storeNameSpaceAtBackend(){

		let setOwnAvatar = (response) => this.props.set_own_avatar(response.data.image)
		let setIsSignedIn = () => this.props.set_signed_in_status( true )

		let image = this.state.user_image

		let formData = new FormData()
		formData.append('user_name', this.state.user_name)
		formData.append('user_phone_number', this.state.phone_number)
		formData.append('avatar_image', {uri: image.uri, name: image.name, type: image.type})
		
		axios.post(`${utils.baseURL}/users/create-user`, formData, 
		{
			onUploadProgress: progressEvent => {
				console.log( 'upload progress: ' + Math.round((progressEvent.loaded / progressEvent.total)*100) + '%' )
			}
		})
		.then(function (response) {

			// console.log(`POST rest call response is${JSON.stringify(response.data, null, 1)}`);


			if (response.data.success === true){
				console.log('yes')
				setOwnAvatar(response)
				setIsSignedIn()
				
			}

		})
		.catch((err) => console.log(err))

	}

	render() {
		return(
			<KeyboardAwareScrollView>
				<View style={styles.screenContainer}>
					
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.roundButton} onPress={() => null} activeOpacity={0.2}>
							<Text style={styles.text}>
								SIGN UP WITH FACEBOOK
							</Text>
						</TouchableOpacity>
					</View>

				
					<View style={styles.orContainer}>
						<View style={styles.leftBar}>
						</View>

						<View style={styles.orTextChild}>
							<Text style={styles.orText}>OR</Text>
						</View>

						<View style={styles.rightBar}>
						</View>
					</View>

					<View style={styles.textinputContainer}>
						<Text style={styles.headingOverInput}>
							NAME
						</Text>
						<TextInput
							style={styles.textinput}
							placeholder="Type your full name"
							placeholderTextColor = {utils.lightGrey}
							onChangeText={ (value) =>  this.setState(prev => ({...prev, user_name: value}))}
						/>
					</View>

					<View style={styles.textinputContainer}>
						<Text style={styles.headingOverInput}>
							PHONE NUMBER
						</Text>
						<TextInput
							style={styles.textinput}
							placeholder="Type your phone number"
							placeholderTextColor = {utils.lightGrey}
							onChangeText={ (value) =>  this.setState(prev => ({...prev, phone_number: value}))}
						/>
					</View>
						


					<View style={{marginTop:40, marginBottom:20}}>
						<Button 
							title={'Select Avatar'}
							color={utils.lightGrey}
							onPress={async () => {
								try {
									let res = await DocumentPicker.pick({
										type: [
											DocumentPicker.types.images,
										],
									});
									console.log(res.uri, res.type, res.name, res.size); // res.type is mimeType
									// setState method with response as argument
									this.setState(prev => ({...prev, user_image: res}))
									console.log(this.state.user_image)

								} catch (err) {
									if (DocumentPicker.isCancel(err)) {
										// User cancelled the picker, exit any dialogs or menus and move on
									} else {
										console.log(err)
										// throw err;
									}
								}
							}}
						/>
					</View>
				
			
					<TouchableOpacity style={styles.lowerButton} activeOpacity={0.2}
						onPress={
							() => {
								this.storeNameAndNumber()
								this.storeNameSpaceAtBackend()
							}
						}
					>
						<Icon
						  // raised
						  name={utils.righAeroIcon}
						  type='font-awesome'
						  // iconStyle='Outlined'
						  color='white'
						  size={30}
						  // onPress={() => console.log('hello')} 
						  // reverse={true}
						/>
					</TouchableOpacity>
									
				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	iconStyle:{
		alignSelf:'center',
	},
	screenContainer:{
		alignItems:'center',
		flex:1,
		// display:'flex',
		// flexDirection: 'column',
		alignItems:'center',
		justifyContent: 'space-between', 
	},

	lowerButton:{
		alignItems: 'center',
		width:'100%',
		paddingTop:15,
		paddingBottom:15,
		marginTop:20,
		// marginBottom:0,
		backgroundColor: utils.lightGreen,
	},

	buttonWithoutBG:{
		marginTop:50,
		marginBottom:50,

	},
	textinput:{
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
	orText:{
		color:utils.lightGrey,
		fontSize:20,
		textAlign:'center',
	},
	orTextChild:{
		flex:1,
	},
	rightBar:{
		flex:3,
		borderBottomWidth:1,
		borderColor:utils.lightGrey,
		width:'100%',
	},
	leftBar:{
		flex:3,
		borderBottomWidth:1,
		borderColor:utils.lightGrey,
	},
	orContainer:{
		marginTop:20,
		display:'flex',
		flexDirection:'row',
		alignItems:'center',
		justifyContent: 'center',
		width:'80%',
	},
	buttonContainer:{
		marginTop:30,
		justifyContent: 'center',
		alignSelf:'center',
		height:100,
		width:'80%',
	},
	roundButton:{
		borderRadius:50,
		borderColor:'green',
		borderWidth:2,
		backgroundColor: 'green',
		borderStyle:'solid',
		width:'100%',
		paddingTop:15,
		paddingBottom:15,
	},
	text:{
		fontSize:20,
		color:'white',
		textAlign:'center',
	},
	headingOverInput:{
		width:'100%',
		marginTop:20,
		fontSize:18,
		fontWeight:'bold',
		textAlign:'left',
	},
	textinputContainer:{
		width:'80%',
	}
})