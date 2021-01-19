require('../models/productcategory');
require('../models/product');


const mongoose = require('mongoose');
const router = require('express').Router();
const ProductCategory = mongoose.model('ProductCategory');
const Product = mongoose.model('Product');

// create a new productcategory

router.post('/create_productcategory_with_children', function(req, res, next){

	const newProductCategory = new ProductCategory({

		_id: new mongoose.Types.ObjectId(),
		image_thumbnail: req.body.parent.image_thumbnail,
		category_name: req.body.parent.category_name,
		endpoint: req.body.parent.endpoint,

	});

	newProductCategory.save(function (err, newProductCategory) {
		if (err) return console.log(err);

	//saving children

		const newProduct = new Product({

			_id: new mongoose.Types.ObjectId(),
			image_thumbnail: req.body.children.image_thumbnail,
			product_name: req.body.children.product_name,
			price: req.body.children.price,
			endpoint: req.body.children.endpoint,

		//assigning parent
			product_category:newProductCategory._id,

		});

		newProductCategory.products.push(newProduct._id)

	newProductCategory.save();

	});

});

// find productcategory
	
router.get('/find_productcategory', function(req, res, next){

	ProductCategory.findOne({ endpoint: req.body.endpoint })
		.then((productcategory) => {

			productcategory[ image_thumbnail ] = base64_encode( productcategory[ image_thumbnail ] )

			if (!productcategory) {

				res.status(401).json({ success: false, msg: "could not find productcategory" });

			} else {

				res.status(200).json(productcategory);

			}

		})
		.catch((err) => {

			next(err);

		});
});

// find product
	
router.get('/find_product', function(req, res, next){

	Product.findOne({ title: req.body.title })
		.then((product) => {

			product[ image_thumbnail ] = base64_encode( product[ image_thumbnail ] )

			if (!product) {

				res.status(401).json({ success: false, msg: "could not find product" });

			} else {

				res.status(200).json(product);

			}

		})
		.catch((err) => {

			next(err);

		});
});

// get productcategorys_list

router.get('/productcategorys_list', function(req, res, next){

ProductCategory.
	find().
	limit(10).
	exec((productcategorys)=>{
		productcategorys.map((productcategory, index)=>{
			var newProductCategorys_list = []
			var newProductCategory = {}

			newProductCategory.image_thumbnail = base64_encode( productcategory[image_thumbnail] )
			newProductCategory.category_name = productcategory[category_name]
			newProductCategory.endpoint = productcategory[endpoint]

			newProductCategorys_list.push({...newProductCategory})
			newProductCategory = {}

			return newProductCategorys_list
		});
	})

	.then((newProductCategorys_list) => {

		if (!newProductCategorys_list) {

			res.status(401).json({ success: false, msg: "could not find ProductCategorys_list" });

		} else {

			res.status(200).json(newProductCategorys_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get products_list

router.get('/products_list', function(req, res, next){

Product.
	find().
	limit(10).
	exec((products)=>{
		products.map((product, index)=>{
			var newProducts_list = []
			var newProduct = {}

			newProduct.image_thumbnail = base64_encode( product[image_thumbnail] )
			newProduct.product_name = product[product_name]
			newProduct.price = product[price]
			newProduct.endpoint = product[endpoint]

			newProducts_list.push({...newProduct})
			newProduct = {}

			return newProducts_list
		});
	})

	.then((newProducts_list) => {

		if (!newProducts_list) {

			res.status(401).json({ success: false, msg: "could not find Products_list" });

		} else {

			res.status(200).json(newProducts_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get productcategory with children

router.get('/productcategory_with_children', function(req, res, next){
	ProductCategory.
		findOne({endpoint:req.body.endpoint}).

		populate('category_products').

		exec(function (err, productcategory_with_children) {
			if (err) return console.log(err);

			res.status(200).json(productcategory_with_children);
		});
})


// get productcategory with summarized children

router.get('/productcategory_with_summarized_children', function(req, res, next){
	ProductCategory.
		findOne({endpoint:req.body.endpoint}).

		populate('category_products').

		exec(function (err, blogpost_with_children) {

			if (err) return console.log(err);


			var current_category_products = productcategory_with_children.category_products
			new_category_products = []

			current_products.map((product, index)=>{
				var newProduct = {}

	
				newProduct.image_thumbnail = base64_encode( product[image_thumbnail] )
				newProduct.product_name = product[product_name]
				newProduct.price = product[price]
				newProduct.endpoint = product[endpoint]

				new_products.push({...newProduct})
				newProduct = {}
			});

			productcategory_with_children.products = new_products

		res.status(200).json(productcategory_with_children);

	});
})

// get next 10 productcategorys_list

router.get('/productcategorys_next_10_list', function(req, res, next){

ProductCategory.
	find().
	limit(10).
	skip(10).
	exec( 
		(productcategorys) => {
			productcategorys.map((productcategory, index) => {
				var newProductCategorys_list = []
				var newProductCategory = {}
	
				newProductCategory.image_thumbnail = base64_encode( productcategory[image_thumbnail] )
				newProductCategory.category_name = productcategory[category_name]
				newProductCategory.endpoint = productcategory[endpoint]

				newProductCategorys_list.push({...newProductCategory})
				newProductCategory = {}
				})

			return newProductCategorys_list
		})

	.then((newProductCategorys_list) => {

		if (!newProductCategorys_list) {

			res.status(401).json({ success: false, msg: "could not find ProductCategorys_list" });

		} else {

			res.status(200).json(newProductCategorys_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get next 10 products_list

router.get('/products_next_10_list', function(req, res, next){

Product.
	find().
	limit(10).
	skip(10).
	exec( 
		(products) => {
			products.map((product, index) => {
				var newProducts_list = []
				var newProduct = {}
	
				newProduct.image_thumbnail = base64_encode( product[image_thumbnail] )
				newProduct.product_name = product[product_name]
				newProduct.price = product[price]
				newProduct.endpoint = product[endpoint]

				newProducts_list.push({...newProduct})
				newProduct = {}
				})

			return newProducts_list
		})

	.then((newProducts_list) => {

		if (!newProducts_list) {

			res.status(401).json({ success: false, msg: "could not find Products_list" });

		} else {

			res.status(200).json(newProducts_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

module.exports = router;