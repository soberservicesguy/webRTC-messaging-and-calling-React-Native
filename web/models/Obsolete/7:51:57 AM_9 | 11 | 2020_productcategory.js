
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategorySchema = new mongoose.Schema({

	_id: Schema.Types.ObjectId,

	image_thumbnail:String,
	category_name:String,
	endpoint:String,

// other model links
	category_products:[{ type: Schema.Types.ObjectId, ref: 'Product' }],

})

mongoose.model('ProductCategory', ProductCategorySchema);