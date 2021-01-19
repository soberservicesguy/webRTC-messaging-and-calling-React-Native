
import { connect } from "react-redux";
import {mapStateToProps, mapDispatchToProps} from "./store_configuration";

import AppNavigation from "../the_navigation";

import App from "../App"

import {
	CallIncomingScreen,
	ChatNodesScreen,
	LoginScreen,
	IndividualChatScreen,
} from "../screens";


// import {
// } from "../components";

export const ConnectedAppNavigation = connect(
	mapStateToProps,
	mapDispatchToProps
)(AppNavigation);

// export const ConnectedApp = connect(
// 	mapStateToProps,
// 	mapDispatchToProps
// )(App);



export const ConnectedCallIncomingScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(CallIncomingScreen);

export const ConnectedChatNodesScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatNodesScreen);

export const ConnectedLoginScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(LoginScreen);

export const ConnectedIndividualChatScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(IndividualChatScreen);