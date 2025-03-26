import React from "react";
import { useNavigate } from "react-router-dom";
import "./cardproduct.css"; // Ensure the CSS file is imported

function CardProduct({ product }) {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image-container">
        <img src={`${product.pictureUrl}`} alt={product.name} className="product-image" />
      </div>
      <div className="product-details">
        <div className="product-name">{product.name}</div>
        <div className="product-seller">Seller Name</div>
        <div className="product-footer">
          <div className="product-price">PHP {product.price.toFixed(2)}</div>
          <button className="like-button">❤️</button>
        </div>
      </div>
    </div>
  );
}

export default CardProduct;