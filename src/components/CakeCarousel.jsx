import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CakeCarousel({ cakes = [], onCakeClick }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || cakes.length <= 3) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= cakes.length - 2 ? 0 : prevIndex + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, cakes.length])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= cakes.length - 2 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? cakes.length - 3 : prevIndex - 1
    )
  }

  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }

  if (cakes.length === 0) return null

  return (
    <div 
      className="relative max-w-6xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / 3)}%)`
          }}
        >
          {cakes.map((cake, index) => {
            const isCenter = index === currentIndex + 1
            return (
            <div 
              key={index}
              className="flex-shrink-0 px-3 flex items-center justify-center w-1/3"
            >
              <div 
                className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-96 cursor-pointer w-full border border-white/20 ${
                  isCenter ? 'scale-110 z-10' : 'scale-95 opacity-80'
                }`}
                onClick={() => onCakeClick && onCakeClick(cake)}
              >
                <img
                  src={cake.image}
                  alt={cake.name}
                  className={`w-full object-cover ${
                    isCenter ? 'h-72' : 'h-64'
                  }`}
                />
                <div className={`flex flex-col justify-center items-center flex-1 ${
                  isCenter ? 'p-6' : 'p-4'
                }`}>
                  <h3 className={`font-semibold text-center ${
                    isCenter ? 'text-xl' : 'text-lg'
                  }`}>{cake.name}</h3>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {cakes.length > 3 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/95 hover:bg-white shadow-xl rounded-full p-2 transition-all duration-200 hover:scale-110 z-10 backdrop-blur-sm border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/95 hover:bg-white shadow-xl rounded-full p-2 transition-all duration-200 hover:scale-110 z-10 backdrop-blur-sm border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {cakes.length > 3 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: cakes.length - 2 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
