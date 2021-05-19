require('../models/user');

// require('../models/usercart');

const mongoose = require('mongoose');
const router = require('express').Router();

const { my_logger } = require('../handy_functions/my_custom_logger')
const {
	get_all_rooms_joined_by_user,
} = require('../handy_functions/database_functions')

const User = mongoose.model('User');
// const UserCart = mongoose.model('UserCart');

// create a new user

router.get('/get-rooms', function(req, res, next){
	let rooms = get_all_rooms_joined_by_user(req.query.phone_number)

	if (rooms != 'NO USER FOUND'){
		res.status(200).json(rooms)
	} else {
		res.status(200).json([])
	}

})

router.post('/create-user', function(req, res, next){

	User.find({user_phone_number: req.body.user_phone_number})
	.then((username_objects) => {

		if (username_objects.length === 0) {
			const newUser = new User({

				_id: new mongoose.Types.ObjectId(),
				user_name: req.body.user_name,
				user_phone_number: req.body.user_phone_number,

			});

			newUser.save(function (err, newUser) {
				if (err){
					return console.log(err);
				}

				my_logger( 'user saved', {message:'user saved'}, 'value', '/create-user' , 0)
				// console.log(`user saved`)
			});

			my_logger(`{ success: true, msg: "user saved exists" }`, { success: true, msg: "user saved exists" }, 'function_returning', '/create-user', 0)
			res.status(200).json({ success: true, msg: "user saved exists" });

		} else {

			my_logger( 'user already exists', {message:'user already exists'}, 'value', '/create-user' , 0)
			// console.log('user already exists')
			my_logger(`{ success: false, msg: "user already exists, try another" }`, { success: false, msg: "user already exists, try another" }, 'function_returning', '/create-user', 0)
			res.status(200).json({ success: false, msg: "user already exists, try another" });

		}

	})
	.catch((error) => {

		my_logger('error', error, 'error', '/create-user', 0)
		next(error);

	});		

});

// find user
	
// router.get('/find_user', function(req, res, next){

// 	User.findOne({ endpoint: req.body.endpoint })
// 		.then((user) => {

// 			user[ image_thumbnail ] = base64_encode( user[ image_thumbnail ] )

// 			if (!user) {

// 				res.status(401).json({ success: false, msg: "could not find user" });

// 			} else {

// 				res.status(200).json(user);

// 			}

// 		})
// 		.catch((err) => {

// 			next(err);

// 		});
// });

// // find usercart
	
// router.get('/find_usercart', function(req, res, next){

// 	UserCart.findOne({ title: req.body.title })
// 		.then((usercart) => {
// 			if (!usercart) {

// 				res.status(401).json({ success: false, msg: "could not find usercart" });

// 			} else {

// 				res.status(200).json(usercart);

// 			}

// 		})
// 		.catch((err) => {

// 			next(err);

// 		});
// });

// // get users_list

// router.get('/users_list', function(req, res, next){

// User.
// 	find().
// 	limit(10).
// 	exec((users)=>{
// 		users.map((user, index)=>{
// 			var newUsers_list = []
// 			var newUser = {}

// 			newUser.image_thumbnail = base64_encode( user[image_thumbnail] )
// 			newUser.user_name = user[user_name]
// 			newUser.user_password = user[user_password]
// 			newUser.endpoint = user[endpoint]

// 			newUsers_list.push({...newUser})
// 			newUser = {}

// 			return newUsers_list
// 		});
// 	})

// 	.then((newUsers_list) => {

// 		if (!newUsers_list) {

// 			res.status(401).json({ success: false, msg: "could not find Users_list" });

// 		} else {

// 			res.status(200).json(newUsers_list);

// 		}

// 	})
// 	.catch((err) => {

// 		next(err);

// 	});
// });

// // get usercarts_list

// router.get('/usercarts_list', function(req, res, next){

// UserCart.
// 	find().
// 	limit(10).
// 	exec((usercarts)=>{
// 		usercarts.map((usercart, index)=>{
// 			var newUserCarts_list = []
// 			var newUserCart = {}


// 			newUserCarts_list.push({...newUserCart})
// 			newUserCart = {}

// 			return newUserCarts_list
// 		});
// 	})

// 	.then((newUserCarts_list) => {

// 		if (!newUserCarts_list) {

// 			res.status(401).json({ success: false, msg: "could not find UserCarts_list" });

// 		} else {

// 			res.status(200).json(newUserCarts_list);

// 		}

// 	})
// 	.catch((err) => {

// 		next(err);

// 	});
// });

// // get user with children

// router.get('/user_with_children', function(req, res, next){
// 	User.
// 		findOne({endpoint:req.body.endpoint}).

// 		populate('relatedcart').

// 		exec(function (err, user_with_children) {
// 			if (err) return console.log(err);

// 			res.status(200).json(user_with_children);
// 		});
// })


// // get user with summarized children

// router.get('/user_with_summarized_children', function(req, res, next){
// 	User.
// 		findOne({endpoint:req.body.endpoint}).

// 		populate('relatedcart').

// 		exec(function (err, blogpost_with_children) {

// 			if (err) return console.log(err);


// 			var current_relatedcart = user_with_children.relatedcart
// 			new_relatedcart = []

// 			current_usercarts.map((usercart, index)=>{
// 				var newUserCart = {}

	

// 				new_usercarts.push({...newUserCart})
// 				newUserCart = {}
// 			});

// 			user_with_children.usercarts = new_usercarts

// 		res.status(200).json(user_with_children);

// 	});
// })

// // get next 10 users_list

// router.get('/users_next_10_list', function(req, res, next){

// User.
// 	find().
// 	limit(10).
// 	skip(10).
// 	exec( 
// 		(users) => {
// 			users.map((user, index) => {
// 				var newUsers_list = []
// 				var newUser = {}
	
// 				newUser.image_thumbnail = base64_encode( user[image_thumbnail] )
// 				newUser.user_name = user[user_name]
// 				newUser.user_password = user[user_password]
// 				newUser.endpoint = user[endpoint]

// 				newUsers_list.push({...newUser})
// 				newUser = {}
// 				})

// 			return newUsers_list
// 		})

// 	.then((newUsers_list) => {

// 		if (!newUsers_list) {

// 			res.status(401).json({ success: false, msg: "could not find Users_list" });

// 		} else {

// 			res.status(200).json(newUsers_list);

// 		}

// 	})
// 	.catch((err) => {

// 		next(err);

// 	});
// });

// // get next 10 usercarts_list

// router.get('/usercarts_next_10_list', function(req, res, next){

// UserCart.
// 	find().
// 	limit(10).
// 	skip(10).
// 	exec( 
// 		(usercarts) => {
// 			usercarts.map((usercart, index) => {
// 				var newUserCarts_list = []
// 				var newUserCart = {}
	

// 				newUserCarts_list.push({...newUserCart})
// 				newUserCart = {}
// 				})

// 			return newUserCarts_list
// 		})

// 	.then((newUserCarts_list) => {

// 		if (!newUserCarts_list) {

// 			res.status(401).json({ success: false, msg: "could not find UserCarts_list" });

// 		} else {

// 			res.status(200).json(newUserCarts_list);

// 		}

// 	})
// 	.catch((err) => {

// 		next(err);

// 	});
// });

module.exports = router;