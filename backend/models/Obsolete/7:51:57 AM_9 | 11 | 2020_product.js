
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,

	image_thumbnail:String,
	product_name:String,
	price:String,
	endpoint:String,

// other model links
	product_category:{ type: Schema.Types.ObjectId, ref: 'ProductCategory' },

})

mongoose.model('Product', ProductSchema);