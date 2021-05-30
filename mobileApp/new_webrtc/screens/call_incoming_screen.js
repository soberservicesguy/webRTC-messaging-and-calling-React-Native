import React, {Component} from 'react';
// IMPORT classes to use
import { 
	ImageBackground,
	View,
	StyleSheet, 
	// Button,
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

import { Icon } from 'react-native-elements';
	
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

import utils from "../utilities";

export default class CallIncomingScreen extends Component {
	constructor(props) {
			super(props);
	}
	render() {
		return(
			<View style={styles.screenContainer}>
				
				<View style={styles.somethingContainer}>
				</View>

			</View>	
		);
	}
}

const styles = StyleSheet.create({
	screenContainer:{
		// flex:1,
		// display:'flex',
		alignItems: 'center', // horizontally centered
		justifyContent: 'space-between', 
	},
	somethingContainer:{
		marginTop: windowHeight * 0.05, // or 30  gap
		height: windowHeight * 0.1, // or 100
		width: '80%',
		justifyContent: 'center', // vertically centered
		alignSelf: 'center', // horizontally centered
		// backgroundColor: utils.lightGreen,
	},
});
	