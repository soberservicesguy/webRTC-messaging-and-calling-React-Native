import React, {Component} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import {
	Image,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
} from 'react-native';

import NetInfo from "@react-native-community/netinfo";

import {
	goOnline,
} from "./handy_functions/RTC_video_conference_call_functions"

// IMPORT connected screens
import {
	ConnectedCallIncomingScreen,
	ConnectedChatNodesScreen,
	ConnectedLoginScreen,
	ConnectedIndividualChatScreen,
} from "./redux_stuff/connected_components";

import {
	netinfo_permission,
	request_multiple_permissions,
} from "./handy_functions/permissions_functions"

const Stack = createStackNavigator();

function SignInStack({navigation}) {
	return (
		<Stack.Navigator
			// headerMode='none'
		>

			<Stack.Screen name="Login" component={ConnectedLoginScreen}
				options={{ 
					headerShown:true,
					title: 'Login',
					headerTitleAlign: 'center',
					headerBackTitleVisible: false,
					headerLeft: () => (	<TouchableOpacity activeOpacity={0.2} onPress={() => this.props.navigation.goBack()} style={{
						marginTop:50,
							marginBottom:50,
					}}>
						<Text>
							Go Back
						</Text>
					</TouchableOpacity>	),
					headerRight: () => (<Image source={require('./images/samosa.jpg')} style={{resizeMode: "center", height: 40, width: 40,paddingLeft: 50,}}/>),
				}}
			/>
		
		</Stack.Navigator>
	);
}

function InnerStack({navigation}) {

	return (
		<Stack.Navigator
			// headerMode='none'
		>

			<Stack.Screen name="ChatNodes" component={ConnectedChatNodesScreen}
				options={{ 
					headerShown:true,
					title: 'ChatNodes',
					headerTitleAlign: 'center',
					headerBackTitleVisible: false,
					headerLeft: () => (	<TouchableOpacity activeOpacity={0.2} onPress={() => this.props.navigation.goBack()} style={{
						marginTop:50,
							marginBottom:50,
					}}>
						<Text>
							Go Back
						</Text>
					</TouchableOpacity>	),
					headerRight: () => (<Image source={require('./images/samosa.jpg')} style={{resizeMode: "center", height: 40, width: 40,paddingLeft: 50,}}/>),
				}}
			/>

			<Stack.Screen name="CallIncoming" component={ConnectedCallIncomingScreen}
				options={{ 
					headerShown:true,
					title: 'CallIncoming',
					headerTitleAlign: 'center',
					headerBackTitleVisible: false,
					headerLeft: () => (	<TouchableOpacity activeOpacity={0.2} onPress={() => this.props.navigation.goBack()} style={{
						marginTop:50,
							marginBottom:50,
					}}>
						<Text>
							Go Back
						</Text>
					</TouchableOpacity>	),
					headerRight: () => (<Image source={require('./images/samosa.jpg')} style={{resizeMode: "center", height: 40, width: 40,paddingLeft: 50,}}/>),
				}}
			/>

			<Stack.Screen name="IndividualChat" component={ConnectedIndividualChatScreen}
				options={{ 
					headerShown:true,
					title: 'IndividualChat',
					headerTitleAlign: 'center',
					headerBackTitleVisible: false,
					headerLeft: () => (	<TouchableOpacity activeOpacity={0.2} onPress={() => this.props.navigation.goBack()} style={{
						marginTop:50,
							marginBottom:50,
					}}>
						<Text>
							Go Back
						</Text>
					</TouchableOpacity>	),
					headerRight: () => (<Image source={require('./images/samosa.jpg')} style={{resizeMode: "center", height: 40, width: 40,paddingLeft: 50,}}/>),
				}}
			/>
		
		</Stack.Navigator>
	);
}

const RootStack = createStackNavigator();

class AppNavigation extends Component {
	constructor(props) {
		super(props);
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		// // Typical usage (don't forget to compare states) BUT STATE IS THROUGH props IN REDUX
		// if (this.props.contacts !== prevProps.contacts) {
		// 	show_all_contacts_and_set_in_state()
		// 	console.log("--------LOG--------")
		// 	console.log( this.props.contacts )
		// }
		if ( this.props.is_internet_connected === false &&  prevProps.is_internet_connected === true){
			console.log('FROM this.props.is_internet_connected === false &&  prevProps.is_internet_connected === true')
			// console.log("Connection type", state.type);
			console.log("Is connected?", this.props.is_internet_connected);
			// goOnline(this)
			// goOnline(this)
		}
		

		if ( this.props.is_internet_connected === true ){
			console.log('FROM this.props.is_internet_connected === true')
			// console.log("Connection type", state.type);
			console.log("Is connected?", this.props.is_internet_connected);
			// goOnline(this)
			// goOnline(this)
		}


		if ( this.props.is_internet_connected === true &&  prevProps.is_internet_connected === false){
			console.log('FROM this.props.is_internet_connected === true &&  prevProps.is_internet_connected === false')
			// console.log("Connection type", state.type);
			console.log("Is connected?", this.props.is_internet_connected);
			// goOnline(this)
			// goOnline(this)
		}
	}

	componentDidMount(){
		// request_multiple_permissions()

		this.unsubscribe = NetInfo.addEventListener(state => {
			this.props.set_internet_connection( state.isConnected )
			// this.setState(prev => ({...prev, is_internet_connected: state.isConnected }));
			console.log(state.isConnected)
			console.log('FROM componentDidMOunt')
			console.log("Is connected?", this.props.is_internet_connected);			
		});

	}


	componentWillUnmount(){
		this.unsubscribe()
	}


	render() {
		return (
			<NavigationContainer>
				<RootStack.Navigator headerMode='none'>
					{this.props.isSignedIn !== true 
						? 
							( <RootStack.Screen name="SignInStack" component={SignInStack}/> )
						: 
							( <RootStack.Screen name="InnerStack" component={InnerStack} /> )
					}		
				</RootStack.Navigator>
			</NavigationContainer>
		);
	}
}

export default AppNavigation;