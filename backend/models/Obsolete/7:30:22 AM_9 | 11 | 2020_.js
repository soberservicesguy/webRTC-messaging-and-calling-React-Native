
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,


// other model links
	blogpost:{ type: Schema.Types.ObjectId, ref: '' },

})

mongoose.model('', Schema);