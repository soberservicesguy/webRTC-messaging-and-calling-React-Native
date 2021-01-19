require('../models/user');
require('../models/usercart');


const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const UserCart = mongoose.model('UserCart');

// create a new user

router.post('/create_user_with_children', function(req, res, next){

	const newUser = new User({

		_id: new mongoose.Types.ObjectId(),
		image_thumbnail: req.body.parent.image_thumbnail,
		user_name: req.body.parent.user_name,
		user_password: req.body.parent.user_password,
		endpoint: req.body.parent.endpoint,

	});

	newUser.save(function (err, newUser) {
		if (err) return console.log(err);

	//saving children

		const newUserCart = new UserCart({

			_id: new mongoose.Types.ObjectId(),

		//assigning parent
			related_user:newUser._id,

		});

		newUser.usercarts.push(newUserCart._id)

	newUser.save();

	});

});

// find user
	
router.get('/find_user', function(req, res, next){

	User.findOne({ endpoint: req.body.endpoint })
		.then((user) => {

			user[ image_thumbnail ] = base64_encode( user[ image_thumbnail ] )

			if (!user) {

				res.status(401).json({ success: false, msg: "could not find user" });

			} else {

				res.status(200).json(user);

			}

		})
		.catch((err) => {

			next(err);

		});
});

// find usercart
	
router.get('/find_usercart', function(req, res, next){

	UserCart.findOne({ title: req.body.title })
		.then((usercart) => {
			if (!usercart) {

				res.status(401).json({ success: false, msg: "could not find usercart" });

			} else {

				res.status(200).json(usercart);

			}

		})
		.catch((err) => {

			next(err);

		});
});

// get users_list

router.get('/users_list', function(req, res, next){

User.
	find().
	limit(10).
	exec((users)=>{
		users.map((user, index)=>{
			var newUsers_list = []
			var newUser = {}

			newUser.image_thumbnail = base64_encode( user[image_thumbnail] )
			newUser.user_name = user[user_name]
			newUser.user_password = user[user_password]
			newUser.endpoint = user[endpoint]

			newUsers_list.push({...newUser})
			newUser = {}

			return newUsers_list
		});
	})

	.then((newUsers_list) => {

		if (!newUsers_list) {

			res.status(401).json({ success: false, msg: "could not find Users_list" });

		} else {

			res.status(200).json(newUsers_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get usercarts_list

router.get('/usercarts_list', function(req, res, next){

UserCart.
	find().
	limit(10).
	exec((usercarts)=>{
		usercarts.map((usercart, index)=>{
			var newUserCarts_list = []
			var newUserCart = {}


			newUserCarts_list.push({...newUserCart})
			newUserCart = {}

			return newUserCarts_list
		});
	})

	.then((newUserCarts_list) => {

		if (!newUserCarts_list) {

			res.status(401).json({ success: false, msg: "could not find UserCarts_list" });

		} else {

			res.status(200).json(newUserCarts_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get user with children

router.get('/user_with_children', function(req, res, next){
	User.
		findOne({endpoint:req.body.endpoint}).

		populate('relatedcart').

		exec(function (err, user_with_children) {
			if (err) return console.log(err);

			res.status(200).json(user_with_children);
		});
})


// get user with summarized children

router.get('/user_with_summarized_children', function(req, res, next){
	User.
		findOne({endpoint:req.body.endpoint}).

		populate('relatedcart').

		exec(function (err, blogpost_with_children) {

			if (err) return console.log(err);


			var current_relatedcart = user_with_children.relatedcart
			new_relatedcart = []

			current_usercarts.map((usercart, index)=>{
				var newUserCart = {}

	

				new_usercarts.push({...newUserCart})
				newUserCart = {}
			});

			user_with_children.usercarts = new_usercarts

		res.status(200).json(user_with_children);

	});
})

// get next 10 users_list

router.get('/users_next_10_list', function(req, res, next){

User.
	find().
	limit(10).
	skip(10).
	exec( 
		(users) => {
			users.map((user, index) => {
				var newUsers_list = []
				var newUser = {}
	
				newUser.image_thumbnail = base64_encode( user[image_thumbnail] )
				newUser.user_name = user[user_name]
				newUser.user_password = user[user_password]
				newUser.endpoint = user[endpoint]

				newUsers_list.push({...newUser})
				newUser = {}
				})

			return newUsers_list
		})

	.then((newUsers_list) => {

		if (!newUsers_list) {

			res.status(401).json({ success: false, msg: "could not find Users_list" });

		} else {

			res.status(200).json(newUsers_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get next 10 usercarts_list

router.get('/usercarts_next_10_list', function(req, res, next){

UserCart.
	find().
	limit(10).
	skip(10).
	exec( 
		(usercarts) => {
			usercarts.map((usercart, index) => {
				var newUserCarts_list = []
				var newUserCart = {}
	

				newUserCarts_list.push({...newUserCart})
				newUserCart = {}
				})

			return newUserCarts_list
		})

	.then((newUserCarts_list) => {

		if (!newUserCarts_list) {

			res.status(401).json({ success: false, msg: "could not find UserCarts_list" });

		} else {

			res.status(200).json(newUserCarts_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

module.exports = router;