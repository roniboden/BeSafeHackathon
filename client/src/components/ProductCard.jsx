import PropTypes from 'prop-types'; 
import '../styles/ProductCard.css';

const ProductCard = ({ product, userBalance, onBuy }) => {
  const canAfford = userBalance >= product.price;
  const isOutOfStock = !product.inStock;
  
  const handleBuyClick = () => {
    if (canAfford && !isOutOfStock) {
      onBuy(product);
    }
  };

  return (
    <div className="card">
      {product.tag && (
        <span className="tag">{product.tag}</span>
      )}

      <div className="image-container">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className={`product-image ${isOutOfStock ? 'out-of-stock-overlay' : ''}`} 
        />
      </div>

      <div className="card-content">
        <div className="type-label">
          {product.type === 'digital' ? 'Digital Item' : 'Physical Item'}
        </div>

        <h3 className="card-title">
          {product.title}
        </h3>

        <div className="card-footer">
          <div className="price-container">
            <span className="price-value">
              {product.price.toLocaleString()} 🪙
            </span>
          </div>

          <button
            onClick={handleBuyClick}
            disabled={!canAfford || isOutOfStock}
            className="buy-button"
          >
            {isOutOfStock ? 'Out of Stock' : canAfford ? 'Buy' : 'Not Enough'}
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    price: PropTypes.number,
    imageUrl: PropTypes.string,
    type: PropTypes.string,
    tag: PropTypes.string,
    inStock: PropTypes.bool,
  }).isRequired,
  userBalance: PropTypes.number.isRequired,
  onBuy: PropTypes.func.isRequired,
};

export default ProductCard;