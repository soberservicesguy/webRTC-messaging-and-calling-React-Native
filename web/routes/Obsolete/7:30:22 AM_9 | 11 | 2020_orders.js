require('../models/order');
require('../models/');


const mongoose = require('mongoose');
const router = require('express').Router();
const Order = mongoose.model('Order');
const  = mongoose.model('');

// create a new order

router.post('/create_order_with_children', function(req, res, next){

	const newOrder = new Order({

		_id: new mongoose.Types.ObjectId(),
		time_of_order: req.body.parent.time_of_order,
		total_amount: req.body.parent.total_amount,
		order_address: req.body.parent.order_address,
		endpoint: req.body.parent.endpoint,

	});

	newOrder.save(function (err, newOrder) {
		if (err) return console.log(err);

	//saving children

		const new = new ({

			_id: new mongoose.Types.ObjectId(),

		//assigning parent
			blogpost:newOrder._id,

		});

		newOrder.s.push(new._id)

	newOrder.save();

	});

});

// find order
	
router.get('/find_order', function(req, res, next){

	Order.findOne({ endpoint: req.body.endpoint })
		.then((order) => {
			if (!order) {

				res.status(401).json({ success: false, msg: "could not find order" });

			} else {

				res.status(200).json(order);

			}

		})
		.catch((err) => {

			next(err);

		});
});

// find 
	
router.get('/find_', function(req, res, next){

	.findOne({ comment_timestamp: req.body.comment_timestamp })
		.then(() => {
			if (!) {

				res.status(401).json({ success: false, msg: "could not find " });

			} else {

				res.status(200).json();

			}

		})
		.catch((err) => {

			next(err);

		});
});

// get orders_list

router.get('/orders_list', function(req, res, next){

Order.
	find().
	limit(10).
	exec((orders)=>{
		orders.map((order, index)=>{
			var newOrders_list = []
			var newOrder = {}

			newOrder.time_of_order = order[time_of_order]
			newOrder.total_amount = order[total_amount]
			newOrder.order_address = order[order_address]
			newOrder.endpoint = order[endpoint]

			newOrders_list.push({...newOrder})
			newOrder = {}

			return newOrders_list
		});
	})

	.then((newOrders_list) => {

		if (!newOrders_list) {

			res.status(401).json({ success: false, msg: "could not find Orders_list" });

		} else {

			res.status(200).json(newOrders_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get s_list

router.get('/s_list', function(req, res, next){

.
	find().
	limit(10).
	exec((s)=>{
		s.map((, index)=>{
			var news_list = []
			var new = {}


			news_list.push({...new})
			new = {}

			return news_list
		});
	})

	.then((news_list) => {

		if (!news_list) {

			res.status(401).json({ success: false, msg: "could not find s_list" });

		} else {

			res.status(200).json(news_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get order with children

router.get('/order_with_children', function(req, res, next){
	Order.
		findOne({endpoint:req.body.endpoint}).

		populate('products').
		populate('user').

		exec(function (err, order_with_children) {
			if (err) return console.log(err);

			res.status(200).json(order_with_children);
		});
})


// get order with summarized children

router.get('/order_with_summarized_children', function(req, res, next){
	Order.
		findOne({endpoint:req.body.endpoint}).

		populate('products').
		populate('user').

		exec(function (err, blogpost_with_children) {

			if (err) return console.log(err);


			var current_products = order_with_children.products
			new_products = []

			var current_user = order_with_children.user
			new_user = []

			current_s.map((, index)=>{
				var new = {}

	

				new_s.push({...new})
				new = {}
			});

			order_with_children.s = new_s

		res.status(200).json(order_with_children);

	});
})

// get next 10 orders_list

router.get('/orders_next_10_list', function(req, res, next){

Order.
	find().
	limit(10).
	skip(10).
	exec( 
		(orders) => {
			orders.map((order, index) => {
				var newOrders_list = []
				var newOrder = {}
	
				newOrder.time_of_order = order[time_of_order]
				newOrder.total_amount = order[total_amount]
				newOrder.order_address = order[order_address]
				newOrder.endpoint = order[endpoint]

				newOrders_list.push({...newOrder})
				newOrder = {}
				})

			return newOrders_list
		})

	.then((newOrders_list) => {

		if (!newOrders_list) {

			res.status(401).json({ success: false, msg: "could not find Orders_list" });

		} else {

			res.status(200).json(newOrders_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

// get next 10 s_list

router.get('/s_next_10_list', function(req, res, next){

.
	find().
	limit(10).
	skip(10).
	exec( 
		(s) => {
			s.map((, index) => {
				var news_list = []
				var new = {}
	

				news_list.push({...new})
				new = {}
				})

			return news_list
		})

	.then((news_list) => {

		if (!news_list) {

			res.status(401).json({ success: false, msg: "could not find s_list" });

		} else {

			res.status(200).json(news_list);

		}

	})
	.catch((err) => {

		next(err);

	});
});

module.exports = router;