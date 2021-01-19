import React, {Component} from 'react';
import {Provider} from "react-redux";
// IMPORT store
import {store} from "./redux_stuff/store_configuration";
// IMPORT ConnectedAppContainer
import {ConnectedAppNavigation} from "./redux_stuff/connected_components";

export default function App() {
	return (
		<Provider store={store}>
			<ConnectedAppNavigation />
		</Provider>
	);
}

// import React, {Component} from 'react';
// import {Provider} from "react-redux";
// // IMPORT store
// import {store} from "./redux_stuff/store_configuration";
// // IMPORT ConnectedAppContainer
// import {ConnectedAppNavigation} from "./redux_stuff/connected_components";

// export default class App extends Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			is_internet_connected:false,
// 		}
// 	}


// 	componentDidUpdate(prevProps, prevState, snapshot){
// 		// // Typical usage (don't forget to compare states) BUT STATE IS THROUGH props IN REDUX
// 		// if (this.props.contacts !== prevProps.contacts) {
// 		// 	show_all_contacts_and_set_in_state()
// 		// 	console.log("--------LOG--------")
// 		// 	console.log( this.props.contacts )
// 		// }
// 		if ( this.state.is_internet_connected === true &&  prevState.is_internet_connected === false){
// 			goOnline
// 		}

// 	}

// 	componentDidMount(){
// 		this.unsubscribe = NetInfo.addEventListener(state => {
// 			console.log("Connection type", state.type);
// 			console.log("Is connected?", state.isConnected);
// 			// this.props.set_internet_connection( state.isConnected )

// 			this.setState(prev => ({...prev, is_internet_connected: state.isConnected }));
			
// 		});
// 	}


// 	componentWillUnmount(){
// 		this.unsubscribe()
// 	}

// 	render() {
// 		return (
// 			<Provider store={store}>
// 				<ConnectedAppNavigation />
// 			</Provider>
// 		);
// 	}
// }

// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */

// import React from 'react';
// import {
// 	SafeAreaView,
// 	StyleSheet,
// 	ScrollView,
// 	View,
// 	Text,
// 	TextInput,
// 	Button,
// 	StatusBar,
// 	TouchableOpacity,
// 	Dimensions,
// 	FlatList,
// } from 'react-native';

// import {
// 	RTCPeerConnection,
// 	RTCIceCandidate,
// 	RTCSessionDescription,
// 	RTCView,
// 	MediaStream,
// 	MediaStreamTrack,
// 	mediaDevices,
// 	registerGlobals
// } from 'react-native-webrtc';

// import io from 'socket.io-client'

// import Video from './src/components/video'

// // import RTC_settings from "./handy_functions/RTC_settings"

// import {
// 	getLocalStream,
// 	// whoisOnline,
// 	// sendToPeer,
// 	// createPeerConnection,
// 	joinRoom,
// 	switchVideo,
// 	stopTracks,
// 	send_message,
// 	show_new_message,
// } from "./handy_functions/RTC_video_conference_call_functions"

// import NetInfo from "@react-native-community/netinfo";

// const dimensions = Dimensions.get('window')
// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;



// class App extends React.Component {
// 	constructor(props) {
// 		super(props)
// 		this.state = {
// 			// connection_state: connection_state,
// 			// connection_state: useNetInfo().isConnected.toString(),
// 			// // pc_config: RTC_settings,
// 			// pc_config: {
// 			// 	"iceServers": [
// 			// 		{
// 			// 			"url" : 'stun:stun.l.google.com:19302'
// 			// 		},
// 			// 	]
// 			// },

// 			// sdpConstraints: {
// 			// 	'mandatory': {
// 			// 		'OfferToReceiveAudio': true,
// 			// 		'OfferToReceiveVideo': true
// 			// 	}
// 			// },

// 			// sdpConstraintsForVoiceCall: {
// 			// 	'mandatory': {
// 			// 		'OfferToReceiveAudio': true,
// 			// 		'OfferToReceiveVideo': false,
// 			// 	}				
// 			// },

// 			// camera: true,
// 			// mic: true,

// 			// // DONT FORGET TO CHANGE TO YOUR URL
// 			// serviceIP: 'https://74635b627c3b.ngrok.io', // webrtcPeer is namespace
// 			// namespace: 'webrtcPeer' // doesnt need to be contant

// 			// connection: check_connection_status(),
// 		}

// 		// DONT FORGET TO CHANGE TO YOUR URL
// 		// this.serviceIP = RTC_settings.serviceIP

// 		// this.sdp
// 		this.socket = null
// 		// this.candidates = []
// 	}

// 	componentDidUpdate(prevProps, prevState, snapshot){
// 		// Typical usage (don't forget to compare states) BUT STATE IS THROUGH props IN REDUX

// 		// gone online
// 		// NOT NEEDED ANYMORE
// 		if (this.state.connection.isConnected === true && prevState.connection.isConnected === false) {
// 			eventEmitter.emit('back_online', object)
// 		}

// 		// if (this.state.connection_state === 'connected') {
// 		// 	eventEmitter.emit('scream');
// 		// }
// 	}

// // all callbacks
// 	getLocalStream = () => getLocalStream(this)
// 	joinRoom = () => joinRoom(this)
// 	switchVideo = (video) => switchVideo(this, video)
// 	stopTracks = (stream) => stopTracks(stream)
// 	// sendToPeer = () => sendToPeer(this, messageType, payload, socketID)
// 	// whoisOnline = () => whoisOnline(this)
// 	// createPeerConnection = () => createPeerConnection(this, socketID, callback)
// 	send_message = (message) => send_message(this, message)
// 	// show_new_message = () => show_new_message()
	
// 	componentDidMount(){
// 		this.unsubscribe = NetInfo.addEventListener(state => {
// 			console.log("Connection type", state.type);
// 			console.log("Is connected?", state.isConnected);
// 			// handle connection change here
// 		});
// 	}

// 	componentWillUnmount(){
// 		this.unsubscribe()
// 	}

// 	render() {
// 		const {
// 			localStream,
// 			remoteStreams,
// 			peerConnections,
// 			room,
// 			connect,
// 		} = this.props

// 		// debugger
// 		const remoteVideos = remoteStreams.map(rStream => {
// 			return (
// 				<TouchableOpacity onPress={() => this.switchVideo(rStream)}>
// 					<View
// 						style={{
// 						flex: 1,
// 						width: '100%',
// 						backgroundColor: 'black',
// 						justifyContent: 'center',
// 						alignItems: 'center',
// 						padding: 2,
// 					}}>
// 						<Video
// 							key={2}
// 							mirror={true}
// 							style={{ ...styles.rtcViewRemote }}
// 							objectFit='contain'
// 							streamURL={rStream.stream}
// 							type='remote'
// 						/>
// 					</View>
// 				</TouchableOpacity>
// 			)
// 		})

// 		const remoteVideo = this.props.selectedVideo ?
// 			(
// 				<Video
// 					key={2}
// 					mirror={true}
// 					style={{ width: dimensions.width, height: dimensions.height / 2, }}
// 					objectFit='cover'
// 					streamURL={this.props.selectedVideo && this.props.selectedVideo.stream}
// 					type='remote'
// 				/>
// 			) :
// 			(
// 				<View style={{ padding: 15, }}>
// 					<Text style={{ fontSize:22, textAlign: 'center', color: 'white' }}>Waiting for Peer connection ...</Text>
// 				</View>
// 			)

// 		if (connect) 
// 		// if ( !connect ) 
// 			return (
// 				<SafeAreaView style={{ flex: 1, }}>
// 					<StatusBar backgroundColor="blue" barStyle={'dark-content'}/>
// 					<View style={{
// 						...styles.buttonsContainer,
// 						// backgroundColor: 'teal',
// 						paddingHorizontal: 15
// 					}}>
// 						<TextInput
// 							// editable
// 							maxLength={10}
// 							slectionColor={'green'}
// 							placeholderTextColor = "lightgrey"
// 							placeholder='e.g. room1'
// 							style={{
// 								width: 200,
// 								color: 'black',
// 								fontSize: 18,
// 								backgroundColor: 'white',
// 								borderColor: '#000000',
// 								borderWidth: 1,
// 								paddingHorizontal: 10,
// 							}}
// 							value={room}
// 							onChangeText={text => this.props.set_room(text)}
// 						/>
// 						<Button
// 							onPress={() => joinRoom(this, this.props.room)}
// 							title="Join Room"
// 							color="black"
// 						/>
// 					</View>
// 				</SafeAreaView>
// 			)

// 			const videoActionButtons = (
// 				<View style={{
// 					...styles.buttonsContainer,
// 					justifyContent: 'center', alignItems: 'center',
// 					paddingHorizontal: 15
// 				}}>
// 					<Button
// 						onPress={() => send_message(this, 'the message')}
// 						title={`send message`}
// 						color={`${ this.props.camera && 'black' || 'red'}`}
// 					/>

// 					<Button
// 						onPress={() => {
// 							// debugger
// 							const videoTrack = localStream.getTracks().filter(track => track.kind === 'video')
// 							videoTrack[0].enabled = !videoTrack[0].enabled
// 							// Reduxified
// 							// this.setState({
// 							// 	camera: videoTrack[0].enabled
// 							// })
// 							this.props.set_videotrack_on_camera( videoTrack[0].enabled )
// 						}}
// 						title={`camera ${ this.props.camera && '(on)' || '(off)'}`}
// 						color={`${ this.props.camera && 'black' || 'red'}`}
// 					/>
// 					<Button
// 						onPress={() => {
// 							// debugger
// 							const audioTrack = localStream.getTracks().filter(track => track.kind === 'audio')
// 							audioTrack[0].enabled = !audioTrack[0].enabled
// 							// Reduxified
// 							// this.setState({
// 							// 	mic: audioTrack[0].enabled
// 							// })
// 							this.props.set_audiotrack_on_camera( audioTrack[0].enabled )
// 						}}
// 						title={`mic ${ this.props.mic && '(on)' || '(off)'}`}
// 						color={`${ this.props.mic && 'black' || 'red'}`}
// 					/>
// 					<Button
// 						onPress={() => {
// 							// disconnect socket
// 							this.socket.close()

// 							// localStream.stop()
// 							this.stopTracks(localStream)

// 							// stop all remote audio & video tracks
// 							remoteStreams.forEach(rVideo => this.stopTracks(rVideo.stream))

// 							// stop all remote peerconnections
// 							peerConnections && Object.values(peerConnections).forEach(pc => pc.close())
// 							// Reduxified
// 							// this.setState({
// 							// 	connect: false,
// 							// 	peerConnections: {},
// 							// 	remoteStreams: [],
// 							// 	localStream: null,
// 							// 	remoteStream: null,
// 							// 	selectedVideo: null,
// 							// })
// 							this.props.set_connect( false )
// 							this.props.set_peerconnections( {} )
// 							this.props.set_remotesteams( [] )
// 							this.props.set_localstream( null )
// 							this.props.set_remotestream( null )
// 							this.props.set_selectedvideo( null )

// 						}}
// 						title='X DISCONNECT'
// 						color='red'
// 					/>
// 				</View>
// 			)

// 		return (

// 			<SafeAreaView style={{ flex: 1, }}>
// 				<StatusBar backgroundColor="blue" barStyle={'dark-content'}/>

// 				{ videoActionButtons }
// 				<View>
// 					<FlatList
// 						style={{height:200, backgroundColor: 'green'}}
// 						snapToInterval={100} // set it to height of component
// 						data={this.props.messages} // create DATA as list of objects
// 						renderItem={
// 							({ item }, index) => (
// 								<Text style={{color:'black', fontSize:20}}>
// 									{item}	
// 								</Text>
// 							)
// 						}
// 						keyExtractor={index => String(index)}
// 					/>
// 				</View>

// 				<View style={{ ...styles.videosContainer, }}>
// 					<View style={{
// 						position: 'absolute',
// 						zIndex: 1,
// 						top: 10,
// 						right: 10,
// 						width: 100,
// 						// height: 150,
// 						backgroundColor: 'black', //width: '100%', height: '100%'
// 					}}>
// 						<View style={{flex: 1 }}>
// 							<TouchableOpacity onPress={() => localStream._tracks[1]._switchCamera()}>
// 								<View>
// 									<Video
// 										key={1}
// 										zOrder={0}
// 										objectFit='cover'
// 										style={{ ...styles.rtcView }}
// 										streamURL={localStream}
// 										type='local'
// 									/>
// 								</View>
// 							</TouchableOpacity>
// 						</View>
// 					</View>
// 					{/* <ScrollView horizontal={true} style={{ 
// 						flex: 1,
// 						backgroundColor: 'black',
// 						padding: 15,
// 					 }}> */}
// 						<View
// 							onPress={() => alert('hello')}
// 							style={{
// 								flex: 1,
// 								width: '100%',
// 								backgroundColor: 'black',
// 								justifyContent: 'center',
// 								alignItems: 'center',
// 							}}
// 						>
// 							{ remoteVideo }
// 						</View>
// 					{/* </ScrollView> */}
// 					<ScrollView horizontal={true} style={{ ...styles.scrollView }}>
// 						{ remoteVideos }
// 					</ScrollView>
// 					</View>
// 				</SafeAreaView>
// 			);
// 	}
// };

// const styles = StyleSheet.create({
// 	buttonsContainer: {
// 		flexDirection: 'row',
// 		backgroundColor: "white" 
// 	},
// 	button: {
// 		margin: 5,
// 		paddingVertical: 10,
// 		backgroundColor: 'lightgrey',
// 		borderRadius: 5,
// 	},
// 	textContent: {
// 		fontFamily: 'Avenir',
// 		fontSize: 20,
// 		textAlign: 'center',
// 	},
// 	videosContainer: {
// 		flex: 1,
// 		flexDirection: 'row',
// 		justifyContent: 'center',
// 	},
// 	rtcView: {
// 		width: 100, //dimensions.width,
// 		height: 150,//dimensions.height / 2,
// 		backgroundColor: 'black',
// 		borderRadius: 5,
// 	},
// 	scrollView: {
// 		// flex: 1,
// 		// // flexDirection: 'row',
// 		// backgroundColor: 'black',
// 		// padding: 15,
// 		position: 'absolute',
// 		zIndex: 0,
// 		bottom: 10,
// 		right: 0,
// 		left: 0,
// 		// width: 100, height: 200,
// 		backgroundColor: 'rgba(0, 0, 0, 0.3)',
// 	},
// 	rtcViewRemote: {
// 		width: 110, //dimensions.width,
// 		height: 110, //dimensions.height / 2,
// 		// backgroundColor: 'black',
// 		borderRadius: 5,
// 	}
// });

// export default App;