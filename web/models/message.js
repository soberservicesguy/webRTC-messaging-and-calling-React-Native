const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,
	room_string: String,
	message_state: String,

// 1 offline_sent (with sender) IF NO INTERNET
// 1 sent (with sender) => reciever changes to new
// 2 new (with reciever) => reciever changes to read and sends in socket which one seen
// 3 read (with receiver) => sender changes to seen
// 4 seen (with sender)

	sent_time: String,
	text: String,

	// sent_by: String,
	senders_details: String,
// other model links
	room: { type: Schema.Types.ObjectId, ref: 'Room' },
	// senders_detail: { type: Schema.Types.ObjectId, ref: 'UsernameSpace' },
})

// MessageSchema.pre('save', function(next) {
//     this.room_string = this.room.room_string
//     next();
// });


mongoose.model('Message', MessageSchema);