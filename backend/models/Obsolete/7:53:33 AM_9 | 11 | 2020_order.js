
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,

	time_of_order:String,
	total_amount:Number,
	order_address:String,
	endpoint:String,

// other model links
	products:[{ type: Schema.Types.ObjectId, ref: 'Product' }],
	user:{ type: Schema.Types.ObjectId, ref: 'User' },

})

mongoose.model('Order', OrderSchema);