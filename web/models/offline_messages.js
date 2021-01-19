const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfflineMessageSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	message: { type: Schema.Types.ObjectId, ref: 'Message' },
})

mongoose.model('OfflineMessage', OfflineMessageSchema);