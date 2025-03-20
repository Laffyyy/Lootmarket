import Header from "../components/header"
import Banner from "../components/banner"
import StoriesSection from "../components/stories-section"
import ProductsSection from "../components/products-section"
import "@/app/globals.css"

export default function Home() {
  return (
    <main className="main-container">
      <Header />
      <Banner />
      <div className="content-container">
        <StoriesSection />  
        <ProductsSection />
      </div>
    </main>
  )
}