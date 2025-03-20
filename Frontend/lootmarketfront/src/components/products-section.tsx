import { Heart, Bookmark } from "lucide-react"
import Image from "next/image"
import "@/styles/products.css"

export default function ProductsSection() {
  // Sample product data
  const products = [
    {
      id: 1,
      name: "Gaming Headset",
      price: 599.0,
      seller: "Seller Name",
      image: "/placeholder.svg?height=200&width=200",
      liked: false,
    },
  ]

  return (
    <div className="products-section">
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="product-image"
              />
              <button className="bookmark-button">
                <Bookmark className="bookmark-icon" />
              </button>
            </div>
            <div className="product-details">
              <div className="product-header">
                <div className="product-category">Home</div>
                <div className="product-price">PHP {product.price.toFixed(2)}</div>
              </div>
              <div className="product-seller">{product.seller}</div>
              <div className="product-actions">
                <button className="like-button">
                  <Heart className={`like-icon ${product.liked ? "liked" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

