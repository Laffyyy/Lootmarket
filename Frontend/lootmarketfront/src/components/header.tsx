import Link from "next/link"
import { Search, ShoppingCart, User } from "lucide-react"
import "@/styles/header.css"

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-container">
            <Link href="/" className="logo-link">
              <div className="logo-circle">
                <span className="logo-letter">L</span>
              </div>
              <span className="logo-text">LootMarket</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="nav-menu">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/products" className="nav-link">
              Products
            </Link>
            <Link href="/help" className="nav-link">
              Help
            </Link>
            <Link href="/about" className="nav-link">
              About Us
            </Link>
          </nav>

          {/* Search and Icons */}
          <div className="header-actions">
            <div className="search-container">
              <input type="text" placeholder="Search" className="search-input" />
              <Search className="search-icon" />
            </div>
            <button className="icon-button">
              <ShoppingCart className="action-icon" />
            </button>
            <button className="icon-button">
              <User className="action-icon" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

