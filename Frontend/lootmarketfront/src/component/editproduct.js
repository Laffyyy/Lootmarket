import React, { useState } from "react";
import "./editproduct.css";

const EditProduct = ({ onClose, onSave }) => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState(""); // New state for description
  const [image, setImage] = useState(null);

  const handleSave = () => {
    if (!productName || !price || !description || !image) {
      alert("All fields are required!");
      return;
    }
    onSave({
      name: productName,
      price: parseFloat(price),
      description, // Include description in the product object
      image, // Pass the File object directly
    });
  };

  return (
    <div className="edit-product-overlay">
      <div className="edit-product-popup">
        <h2>Add Product</h2>
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label>
          Description: {/* New text field for description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
        <div className="edit-product-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
