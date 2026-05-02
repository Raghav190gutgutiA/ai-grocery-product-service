const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");
const upload = require("../middlewares/upload");
const { verifyToken, isAdmin } = require("../middlewares/userAuth");

const router = require("express").Router();


router.post("/", verifyToken ,isAdmin, upload.array("images", 5), createProduct);


router.get("/", getProducts);
router.get("/:id", getProductById);


router.put("/:id", verifyToken ,isAdmin, upload.array("images", 5), updateProduct);


router.delete("/:id", verifyToken ,isAdmin, deleteProduct);

module.exports = router;