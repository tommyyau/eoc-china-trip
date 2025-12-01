function ImageCard({ image, onRate, onSelect }) {
  const relevanceClass = image.relevance >= 75 ? 'high' : image.relevance >= 50 ? 'medium' : 'low'

  return (
    <div className="image-card">
      <img
        src={image.thumb || image.url}
        alt={image.alt}
        onClick={() => onSelect(image)}
        loading="lazy"
      />
      <div className="image-card-info">
        <div className="image-card-meta">
          <span className={`relevance-score ${relevanceClass}`}>
            {image.relevance}%
          </span>
          <span className="image-source">{image.source}</span>
        </div>
        <div className="image-card-alt">{image.alt}</div>
        {image.photographer && (
          <div className="image-card-photographer">
            by{' '}
            {image.photographerUrl ? (
              <a href={image.photographerUrl} target="_blank" rel="noopener noreferrer">
                {image.photographer}
              </a>
            ) : (
              image.photographer
            )}
          </div>
        )}
        <div className="rating-buttons">
          <button
            className={`rating-btn very-relevant ${image.userRating === 'veryRelevant' ? 'active' : ''}`}
            onClick={() => onRate(image.id, 'veryRelevant')}
          >
            Very Relevant
          </button>
          <button
            className={`rating-btn relevant ${image.userRating === 'relevant' ? 'active' : ''}`}
            onClick={() => onRate(image.id, 'relevant')}
          >
            Relevant
          </button>
          <button
            className={`rating-btn not-relevant ${image.userRating === 'notRelevant' ? 'active' : ''}`}
            onClick={() => onRate(image.id, 'notRelevant')}
          >
            Not Relevant
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCard
