
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    price: { 
      type: Number, 
      required: true 
    },

    category: [
      {
        type: String
      }
    ],

    description: String,

    images: [
      {
        url: String,
        public_id: String,
        isThumbnail: { 
          type: Boolean, 
          default: false 
        }
      }
    ],

    userId: {
      type: String,
      required: true
    },

    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);