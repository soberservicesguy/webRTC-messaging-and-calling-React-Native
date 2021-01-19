
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserCartSchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,


// other model links
	related_user:{ type: Schema.Types.ObjectId, ref: 'User' },

})

mongoose.model('UserCart', UserCartSchema);