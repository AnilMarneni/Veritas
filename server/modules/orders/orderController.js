const mongoose = require('mongoose');
const Order = require('./Order');
const Product = require('../products/Product');

// @desc    Place a new order
// @route   POST /api/v1/orders
// @access  Private (Buyer)
exports.createOrder = async (req, res, next) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Please provide items to buy' });
  }

  // Attempt using a Mongoose Transaction Session
  const session = await mongoose.startSession();
  let transactionActive = false;

  try {
    // Check if the MongoDB connection is a replica set or sharded cluster (required for transactions)
    const isReplicaSet = mongoose.connection.getClient().topology?.description?.type === 'ReplicaSetNoPrimary' || 
                        mongoose.connection.getClient().topology?.description?.type === 'ReplicaSetWithPrimary' ||
                        mongoose.connection.getClient().topology?.description?.servers?.size > 1;

    if (isReplicaSet) {
      session.startTransaction();
      transactionActive = true;
    } else {
      console.warn('⚠️  MongoDB running in standalone mode. Running atomic operations without multi-document transaction wrapper.');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        throw new Error('Invalid item product reference or quantity');
      }

      // Atomically decrement stock level ONLY if current stock satisfies requested quantity
      // This MongoDB query is atomic: finding a product matching filters and updating it occurs in one step.
      const queryFilter = { _id: item.product, stockQuantity: { $gte: item.quantity } };
      const updateDoc = { $inc: { stockQuantity: -item.quantity } };
      const options = { new: true };
      
      if (transactionActive) {
        options.session = session;
      }

      const updatedProduct = await Product.findOneAndUpdate(queryFilter, updateDoc, options);

      if (!updatedProduct) {
        // Query product directly to see if it exists at all
        const checkProduct = await Product.findById(item.product);
        const productName = checkProduct ? `"${checkProduct.name}"` : `ID ${item.product}`;
        throw new Error(`Insufficient stock or invalid product listing for product ${productName}`);
      }

      totalAmount += updatedProduct.price * item.quantity;
      orderItems.push({
        product: updatedProduct._id,
        quantity: item.quantity,
        unitPrice: updatedProduct.price
      });
    }

    const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const orderData = {
      orderNumber,
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress
    };

    const order = new Order(orderData);
    await order.save(transactionActive ? { session } : {});

    if (transactionActive) {
      await session.commitTransaction();
    }
    session.endSession();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (transactionActive) {
      await session.abortTransaction();
    }
    session.endSession();
    
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to place order due to stock or server limitations'
    });
  }
};

// @desc    Get order history for buyer
// @route   GET /api/v1/orders/buyer
// @access  Private (Buyer)
exports.getBuyerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name sku images unitOfMeasure')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order updates for seller
// @route   GET /api/v1/orders/seller
// @access  Private (Farmer)
exports.getSellerOrders = async (req, res, next) => {
  try {
    // Find all products owned by this farmer
    const products = await Product.find({ farmer: req.user._id }).select('_id');
    const productIds = products.map(p => p._id);

    // Find orders that contain any of these products
    const orders = await Order.find({
      'items.product': { $in: productIds }
    })
      .populate('buyer', 'profile.firstName profile.lastName email')
      .populate('items.product', 'name sku farmer')
      .sort({ createdAt: -1 });

    // Filter order items to only show the farmer's items to the farmer
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        item.product && productIds.map(id => id.toString()).includes(item.product._id.toString())
      );
      return orderObj;
    });

    res.status(200).json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Private (Farmer / Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status option' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Role safety check: if farmer is updating, they must own at least one product in the order
    if (req.user.role === 'farmer') {
      const products = await Product.find({ farmer: req.user._id }).select('_id');
      const productIds = products.map(p => p._id.toString());
      const hasProduct = order.items.some(item => productIds.includes(item.product.toString()));

      if (!hasProduct) {
        return res.status(403).json({ success: false, error: 'Not authorized to update status on this order' });
      }
    }

    order.status = status;
    
    // Automatically set payment status to paid if delivered
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    
    // If order is cancelled, return the inventory stock atomically
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity }
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
