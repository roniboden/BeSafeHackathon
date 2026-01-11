import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from './services/api';
import ProductCard from './components/ProductCard';

function StorePage() {
  const [balance, setBalance] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState({ show: false, message: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userString = localStorage.getItem("besafe_user");
      if (!userString) {
        navigate('/');
        return;
      }
      const user = JSON.parse(userString);

      try {
        const balanceRes = await api.get(`/reports/summary/${user.id}`);
        setBalance(balanceRes.data.totalPoints);

        const productsRes = await api.get('/shop/items');
        setProducts(productsRes.data);
      } catch (error) {
        console.error("Failed to load store data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleBuy = async (product) => {
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    if (!user?.id) return;

    if (balance < product.price) {
      alert("Insufficient coins for this purchase");
      return;
    }

    try {
      const response = await api.post('/shop/buy', {
        userId: user.id,
        itemId: product.id
      });

      setBalance(response.data.newBalance);

      setSuccessModal({
        show: true,
        message: `Enjoy! The ${product.title} is yours`
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Error processing purchase";
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'Arial', direction: 'ltr' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        <div style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          Balance: <span style={{ color: '#f59e0b', fontSize: '1.2em' }}>{loading ? '...' : balance.toLocaleString()} 🪙</span>
        </div>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Rewards Store 🎁</h1>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading products</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                title: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                tag: product.tag,
                type: product.type || 'physical',
                inStock: product.inStock
              }}
              userBalance={balance}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}

      {successModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            maxWidth: '400px',
            width: '90%',
            animation: 'popIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Awesome</h2>
            <p style={{ fontSize: '18px', color: '#718096', marginBottom: '30px' }}>
              {successModal.message}
            </p>
            <button
              onClick={() => setSuccessModal({ show: false, message: "" })}
              style={{
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(72, 187, 120, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Thanks!
            </button>
          </div>
        </div>
      )}

      <style>{`
        .back-button {
          background-color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }

        .back-button:hover {
          transform: translateX(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          color: #3182ce;
        }

        .back-button svg {
          transition: transform 0.2s;
        }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default StorePage;