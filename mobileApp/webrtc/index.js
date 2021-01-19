// /**
//  * @format
//  */
// import React from 'react';
// import {AppRegistry} from 'react-native';
// // import App from './App';
// import {Provider} from "react-redux";
// // IMPORT store
// import {store} from "./redux_stuff/store_configuration";
// import { ConnectedApp } from "./redux_stuff/connected_components";
// import {name as appName} from './app.json';

// console.disableYellowBox = true;

// function FinalApp() {
// 	return (
// 		<Provider store={store}>
// 			<ConnectedApp />
// 		</Provider>
// 	);
// }



// AppRegistry.registerComponent(appName, () => FinalApp);




/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
