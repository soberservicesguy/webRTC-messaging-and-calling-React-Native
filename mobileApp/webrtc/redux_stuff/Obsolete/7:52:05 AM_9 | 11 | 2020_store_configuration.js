
import {createStore, applyMiddleware} from "redux";
import createSagaMiddleware from "redux-saga";
import { connect } from "react-redux";
import { combineReducers } from 'redux'; 


// IMPORT rootSaga
import {rootSaga} from "../saga_stuff/saga_combined";

import {
	reducerJWT,
	reducerForUser,
	reducerForUserCart,
	reducerForProductCategory,
	reducerForProduct,
	reducerForOrder,
	reducerFor,
} from "./reducers"

export const rootReducer = combineReducers({
	users: reducerForUser,
	usercarts: reducerForUserCart,
	productcategorys: reducerForProductCategory,
	products: reducerForProduct,
	orders: reducerForOrder,
	s: reducerFor,
});

export const mapStateToProps = state => {
  return {

	total_users: state.users.totalUser,
	current_user: state.users.currentUser,

	total_usercarts: state.usercarts.totalUserCart,
	current_usercart: state.usercarts.currentUserCart,

	total_productcategorys: state.productcategorys.totalProductCategory,
	current_productcategory: state.productcategorys.currentProductCategory,

	total_products: state.products.totalProduct,
	current_product: state.products.currentProduct,

	total_orders: state.orders.totalOrder,
	current_order: state.orders.currentOrder,

	total_s: state.s.total,
	current_: state.s.current,

	};
};

export const mapDispatchToProps = dispatch => {
	return {

		add_user: (user_object) => dispatch( { type: "ADD_User", user_object: user_object } ),
		remove_user: (user_id) => dispatch( { type: "REMOVE_User", user_id: user_id } ),
		set_fetched_users: (user_list) => dispatch( { type: "SET_FETCHED_User", user_list: user_list } ),
		set_fetched_10_more_user: (user_list) => dispatch( { type: "SET_FETCHED_10_MORE_User", user_list: user_list } ),
		set_current_user: (current_user) => dispatch( { type: "SET_CURRENT_User", current_user:current_user } ),

		add_usercart: (usercart_object) => dispatch( { type: "ADD_UserCart", usercart_object: usercart_object } ),
		remove_usercart: (usercart_id) => dispatch( { type: "REMOVE_UserCart", usercart_id: usercart_id } ),
		set_fetched_usercarts: (usercart_list) => dispatch( { type: "SET_FETCHED_UserCart", usercart_list: usercart_list } ),
		set_fetched_10_more_usercart: (usercart_list) => dispatch( { type: "SET_FETCHED_10_MORE_UserCart", usercart_list: usercart_list } ),
		set_current_usercart: (current_usercart) => dispatch( { type: "SET_CURRENT_UserCart", current_usercart:current_usercart } ),

		add_productcategory: (productcategory_object) => dispatch( { type: "ADD_ProductCategory", productcategory_object: productcategory_object } ),
		remove_productcategory: (productcategory_id) => dispatch( { type: "REMOVE_ProductCategory", productcategory_id: productcategory_id } ),
		set_fetched_productcategorys: (productcategory_list) => dispatch( { type: "SET_FETCHED_ProductCategory", productcategory_list: productcategory_list } ),
		set_fetched_10_more_productcategory: (productcategory_list) => dispatch( { type: "SET_FETCHED_10_MORE_ProductCategory", productcategory_list: productcategory_list } ),
		set_current_productcategory: (current_productcategory) => dispatch( { type: "SET_CURRENT_ProductCategory", current_productcategory:current_productcategory } ),

		add_product: (product_object) => dispatch( { type: "ADD_Product", product_object: product_object } ),
		remove_product: (product_id) => dispatch( { type: "REMOVE_Product", product_id: product_id } ),
		set_fetched_products: (product_list) => dispatch( { type: "SET_FETCHED_Product", product_list: product_list } ),
		set_fetched_10_more_product: (product_list) => dispatch( { type: "SET_FETCHED_10_MORE_Product", product_list: product_list } ),
		set_current_product: (current_product) => dispatch( { type: "SET_CURRENT_Product", current_product:current_product } ),

		add_order: (order_object) => dispatch( { type: "ADD_Order", order_object: order_object } ),
		remove_order: (order_id) => dispatch( { type: "REMOVE_Order", order_id: order_id } ),
		set_fetched_orders: (order_list) => dispatch( { type: "SET_FETCHED_Order", order_list: order_list } ),
		set_fetched_10_more_order: (order_list) => dispatch( { type: "SET_FETCHED_10_MORE_Order", order_list: order_list } ),
		set_current_order: (current_order) => dispatch( { type: "SET_CURRENT_Order", current_order:current_order } ),

		add_: (_object) => dispatch( { type: "ADD_", _object: _object } ),
		remove_: (_id) => dispatch( { type: "REMOVE_", _id: _id } ),
		set_fetched_s: (_list) => dispatch( { type: "SET_FETCHED_", _list: _list } ),
		set_fetched_10_more_: (_list) => dispatch( { type: "SET_FETCHED_10_MORE_", _list: _list } ),
		set_current_: (current_) => dispatch( { type: "SET_CURRENT_", current_:current_ } ),

	};

};

const sagaMiddleWare = createSagaMiddleware();

export const store = createStore(rootReducer, applyMiddleware(sagaMiddleWare));

sagaMiddleWare.run(rootSaga);