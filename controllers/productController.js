// controllers/productController.js
const { publishToQueue } = require('../broker/rabbit');
const Product = require('../model/Product');

const { uploadToCloudinary } = require('../utils/uploadToCloud');

exports.createProduct = async (req, res) => {
	try {
		const files = req.files;

		if (!files || files.length === 0) {
			return res.status(400).json({ message: 'Images required' });
		}

		const uploads = await Promise.all(
			files.map((file) => uploadToCloudinary(file.buffer))
		);

		const images = uploads.map((img, index) => ({
			url: img.secure_url,
			public_id: img.public_id,
			isThumbnail: index === 0,
		}));

		const product = await Product.create({
			...req.body,
			userId: req.user.id,
			images,
		});
		 await publishToQueue("inventory_events", {
      type: "PRODUCT_CREATED",
      productId: product._id
    });


		res.status(201).json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getProducts = async (req, res) => {
	try {
		const products = await Product.find({ isActive: true });
		res.json(products);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getProductById = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.updateProduct = async (req, res) => {
	try {
		let updateData = { ...req.body };

		if (req.files && req.files.length > 0) {
			const uploads = await Promise.all(
				req.files.map((file) => uploadToCloudinary(file.buffer))
			);

			updateData.images = uploads.map((img, index) => ({
				url: img.secure_url,
				public_id: img.public_id,
				isThumbnail: index === 0,
			}));
		}

		const updated = await Product.findByIdAndUpdate(
			req.params.id,
			updateData,
			{ new: true }
		);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndUpdate(productId, {
      isActive: false
    });

    await publishToQueue("inventory_events", {
      type: "PRODUCT_DELETED",
      productId
    });

    res.json({ message: "Product deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};