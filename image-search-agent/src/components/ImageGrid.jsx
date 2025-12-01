import ImageCard from './ImageCard'

function ImageGrid({ images, onRate, onSelect }) {
  return (
    <div className="image-grid">
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          onRate={onRate}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default ImageGrid
