const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    

    brand: {
      type: String,
      default: "",
    },

    unit: {
      type: String,
      default: "kg",
    },

    weight: {
      type: String,
      default: "",
    },

    category: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
      default: "",
    },

    images: [
      {
        url: String,

        public_id: String,

        isThumbnail: {
          type: Boolean,
          default: false,
        },
      },
    ],

    ratings: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    userId: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);