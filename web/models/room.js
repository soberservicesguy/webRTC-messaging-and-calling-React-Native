const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,
	room_string: String, // smallerNumber-largerNumber

// other model links
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }], // both numbers from room_string
	messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }], 
})

mongoose.model('Room', RoomSchema);