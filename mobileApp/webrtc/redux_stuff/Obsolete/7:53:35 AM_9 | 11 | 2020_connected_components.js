
import { connect } from "react-redux";
import {mapStateToProps, mapDispatchToProps} from "./store_configuration";

import AppNavigation from "../the_navigation";

import {


	ProductCategoryScreen,	ProductScreen,
	OrderScreen,
} from "../screens";


import {

	IndividualUserCart,
	IndividualProductCategory,	IndividualProduct,
	IndividualOrder,

} from "../components";

export const ConnectedAppNavigation = connect(
	mapStateToProps,
	mapDispatchToProps
)(AppNavigation);



export const ConnectedIndividualProductCategory = connect(
	mapStateToProps,
	mapDispatchToProps
)(IndividualProductCategory);

export const ConnectedProductCategoryScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(ProductCategoryScreen);



export const ConnectedIndividualOrder = connect(
	mapStateToProps,
	mapDispatchToProps
)(IndividualOrder);

export const ConnectedOrderScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(OrderScreen);



export const ConnectedIndividualUserCart = connect(
	mapStateToProps,
	mapDispatchToProps
)(IndividualUserCart);



export const ConnectedIndividualProduct = connect(
	mapStateToProps,
	mapDispatchToProps
)(IndividualProduct);



export const ConnectedProductScreen = connect(
	mapStateToProps,
	mapDispatchToProps
)(ProductScreen);

