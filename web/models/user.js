const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	user_phone_number: String,
	user_name: String,

	display_picture: String,

// other model links
	rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }], // added when needed
	offline_messages: [{ type: Schema.Types.ObjectId, ref: 'OfflineMessage' }], // added when needed
})



mongoose.model('User', UserSchema);

// room
// smallerNumber-largerNumber+
// 00923352065005-00923463189196+

// namespace
// smallerNumber