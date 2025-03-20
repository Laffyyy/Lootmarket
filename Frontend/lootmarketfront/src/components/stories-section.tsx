import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import "@/styles/stories.css"

export default function StoriesSection() {
  return (
    <div className="stories-section">
      <h2 className="section-title">Stories</h2>
      <div className="stories-container">
        <div className="stories-scroll">
          {/* Add Story */}
          <div className="add-story-card">
            <div className="add-icon-circle">
              <Plus className="add-icon" />
            </div>
            <span className="add-text">Add Story</span>
          </div>

          {/* Story Content */}
          <div className="story-card">
            <div className="story-image-container">
              <Image
                src="/placeholder.svg?height=150&width=150"
                alt="Story content"
                width={150}
                height={150}
                className="story-image"
              />
            </div>
          </div>

          {/* Empty placeholders to show scrolling */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="story-placeholder"></div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button className="nav-arrow nav-arrow-left">
          <ChevronLeft className="arrow-icon" />
        </button>
        <button className="nav-arrow nav-arrow-right">
          <ChevronRight className="arrow-icon" />
        </button>
      </div>
    </div>
  )
}

