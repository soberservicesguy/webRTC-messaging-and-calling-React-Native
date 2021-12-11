require('../models/user');

// require('../models/usercart');

const mongoose = require('mongoose');
const router = require('express').Router();

const {
	get_all_rooms_joined_by_user,
} = require('../handy_functions/database_functions')

const User = mongoose.model('User');

const multer = require('multer');
const path = require('path');

const {
	get_image_to_display,
	get_multer_storage_to_use,
	get_file_storage_venue,
	get_file_path_to_use,

	use_gcp_storage,
	use_aws_s3_storage,

	save_file_to_gcp,
	gcp_bucket,

	get_snapshots_storage_path,

	save_file_to_aws_s3,

	checkFileTypeForImages,
} = require('../config/storage/')

let timestamp


function upload_user_avatar_image(timestamp){
	return multer({
		storage: get_multer_storage_to_use(timestamp), // image_storage,
		limits:{fileSize: 2000000}, // 1 mb
		fileFilter: function(req, file, cb){
			checkFileTypeForUserAvatar(file, cb);
		}
	}).single('avatar_image'); // this is the field that will be dealt
}


// Check File Type
function checkFileTypeForUserAvatar(file, cb){
	// Allowed ext
	let filetypes = /jpeg|jpg|png|gif/;
	// Check ext
	let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	let mimetype = filetypes.test(file.mimetype);

	if(mimetype && extname){
		console.log('FILE BEING SENT IS OK')
		return cb(null,true);
	} else {
		console.log('FILE SENT IS NOT GOOD')
		cb('Error: jpeg, jpg, png, gif Images Only!');
	}
}


router.get('/get-rooms', function(req, res, next){
	let rooms = get_all_rooms_joined_by_user(req.query.phone_number)

	if (rooms != 'NO USER FOUND'){
		res.status(200).json(rooms)
	} else {
		res.status(200).json([])
	}

})

router.post('/create-user', async function(req, res, next){

	timestamp = Date.now()
	upload_user_avatar_image(timestamp)(req, res, (err) => {

	// wrapping in IIFE since await requires async keyword which cant be applied to above multer function
		{(async () => {
			console.log({body:req.body, query:req.query})

			if(err){

				console.log(err)

			} else {

				if(req.file == undefined){

					res.status(404).json({ success: false, msg: 'File is undefined!',file: `uploads/${req.file?.filename}`})
					return

				} else {

					let newUser
					let newImage

				// WE NEED UPLOADED FILES THEREFORE CREATING CONDITIONS OF USING GCP, AWS, OR DISK STORAGE
				// not needed since we not getting the image

					if (use_gcp_storage){

						// console.log('req.file')
						// console.log(req.file)
						// console.log(filename_used_to_store_image_in_assets)
						await save_file_to_gcp(timestamp, req.file)
						console.log('SAVED TO GCP')

					} else if (use_aws_s3_storage) {

						console.log('SAVED AUTOMATICALLY TO AWS')

					// not needed since we not getting the image
						// let avatar_filename = req.file.key // name of file
						// let avatar_location = req.file.location // url
						// user_avatar_image_to_use = avatar_location

					} else {

					// not needed since we not getting the image
						// user_avatar_image_to_use = user.user_avatar_image

					}


				// creating user, which needs image object
					try{

						console.log('req.body.user_phone_number')
						console.log(req.body.user_phone_number)

						let user_found = await User.findOne({ user_phone_number: req.body.user_phone_number })

						if (user_found !== null || typeof user !== 'undefined'){

							console.log('user_found')
							console.log(user_found)

							res.status(200).json({ success: false, msg: "user already exists, try another" });
							return

						} else {
							console.log(" ")
							console.log(`SAVING USER WITH ${req.body.user_name}`)
							console.log(" ")
							newUser = new User({

								_id: new mongoose.Types.ObjectId(),
								user_name: req.body.user_name,
								user_phone_number: req.body.user_phone_number,
								user_avatar_image: get_file_path_to_use(req.file, 'avatar_images', timestamp),
								object_files_hosted_at: get_file_storage_venue(),

							});

						}


					} catch (err){

						console.log('user not created')
						console.log(err)
					}


					await newUser.save()

					let { user_avatar_image, object_files_hosted_at } = newUser

					try {

						image_in_base64_encoding = await get_image_to_display(user_avatar_image, object_files_hosted_at)

					} catch (err){

						console.log('COULDNT FETCH AVATAR')
						console.log(err)

					}


					res.status(200).json({ success: true, image: image_in_base64_encoding, msg: 'new user saved' });

				}
			}
		})()}

	})

// OLD CODE
	// let username_objects = await User.find({user_phone_number: req.body.user_phone_number})

	// if (username_objects.length === 0) {
	// 	newUser = new User({

	// 		_id: new mongoose.Types.ObjectId(),
	// 		user_name: req.body.user_name,
	// 		user_phone_number: req.body.user_phone_number,
	// 		user_avatar_image: get_file_path_to_use(req.file, 'avatar_images', timestamp),
	// 		object_files_hosted_at: get_file_storage_venue(),

	// 	});

	// 	newUser.save(function (err, newUser) {
	// 		if (err){
	// 			return console.log(err);
	// 		}

	// 	});

	// 	res.status(200).json({ success: true, msg: "user saved exists" });

	// } else {

	// 	res.status(200).json({ success: false, msg: "user already exists, try another" });

	// }

});


router.get('/get-avatar', async function(req, res, next){

	let phone_number = req.query.user_phone_number
	console.log('phone_number for user query')
	console.log(phone_number)

	let user_found = await User.findOne({ user_phone_number: phone_number })

	if (user_found !== null && typeof user_found !== 'undefined'){

		let { user_avatar_image, object_files_hosted_at } = user_found

		try {

			image_in_base64_encoding = await get_image_to_display(user_avatar_image, object_files_hosted_at)
			res.status(200).json({ success: true, image: image_in_base64_encoding });

		} catch (err){

			res.status(200).json({ success: false, msg: "couldnt fetch user avatar" });
			console.log('COULDNT FETCH AVATAR')
			console.log(err)

		}


	} else {

		res.status(200).json({ success: false, msg: "user does not exist" });
		return

	}


})


router.get('/get-name', async function(req, res, next){

	let phone_number = req.query.user_phone_number

	let user_found = await User.findOne({ user_phone_number: phone_number })

	if (user_found !== null && typeof user_found !== 'undefined'){

		let { user_name } = user_found
		console.log({user_found2: user_found})

		try {

			res.status(200).json({ success: true, name: user_name });

		} catch (err){

			res.status(200).json({ success: false, msg: "couldnt fetch user name" });
			console.log(err)

		}


	} else {

		res.status(200).json({ success: false, msg: "user does not exist" });
		return

	}


})







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