
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,

	image_thumbnail:String,
	user_name:String,
	user_password:String,
	endpoint:String,

// other model links
	relatedcart:[{ type: Schema.Types.ObjectId, ref: 'UserCart' }],

})

mongoose.model('User', UserSchema);