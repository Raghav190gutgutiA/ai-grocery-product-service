const { publishToQueue } = require("../broker/rabbit");
const Product = require("../model/Product");
const { uploadToCloudinary } = require("../utils/uploadToCloud");

exports.createProduct = async (req, res) => {
  try {

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "Images required",
      });
    }

    const uploads = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file.buffer)
      )
    );

    const images = uploads.map((img, index) => ({
      url: img.secure_url,
      public_id: img.public_id,
      isThumbnail: index === 0,
    }));

    let categories = [];

    if (req.body.category) {

      if (Array.isArray(req.body.category)) {

        categories = req.body.category;

      } else {

        categories = req.body.category
          .split(",")
          .map((item) => item.trim());
      }
    }

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      brand: req.body.brand,
    //   sku: req.body.sku,
      unit: req.body.unit,
      weight: req.body.weight,
      description: req.body.description,
      featured: req.body.featured || false,
      discountPercentage:
        req.body.discountPercentage || 0,
      category: categories,
      userId: req.user.id,
      images,
    });

    await publishToQueue(
      "inventory_events",
      {
        type: "PRODUCT_CREATED",
        product,
      }
    );

    res.status(201).json(product);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {

    const products = await Product.find({
      isActive: true,
    });

    res.json(products);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {

    const product =
      await Product.findById(req.params.id);

    res.json(product);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {

    let updateData = {
      ...req.body,
    };

    if (req.body.category) {

      if (Array.isArray(req.body.category)) {

        updateData.category =
          req.body.category;

      } else {

        updateData.category =
          req.body.category
            .split(",")
            .map((item) =>
              item.trim()
            );
      }
    }

    if (
      req.files &&
      req.files.length > 0
    ) {

      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer)
        )
      );

      updateData.images = uploads.map(
        (img, index) => ({
          url: img.secure_url,
          public_id: img.public_id,
          isThumbnail: index === 0,
        })
      );
    }

    const updated =
      await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

    await publishToQueue(
      "inventory_events",
      {
        type: "PRODUCT_UPDATED",
        product: updated,
      }
    );

    res.json(updated);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {

    const productId = req.params.id;

    const deletedProduct =
      await Product.findByIdAndUpdate(
        productId,
        {
          isActive: false,
        },
        { new: true }
      );

    await publishToQueue(
      "inventory_events",
      {
        type: "PRODUCT_DELETED",
        product: deletedProduct,
      }
    );

    res.json({
      message: "Product deleted",
    });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
};
exports.getProductsByUserId = async (req, res) => {
  try {

    const products = await Product.find({
      userId: req.user.id,
      isActive: true,
    });

    res.status(200).json(products);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
};