import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from './services/api';
import ProductCard from './components/ProductCard';

function StorePage() {
  const [balance, setBalance] = useState(0);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]); // New state for history
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState({ show: false, message: "" });
  const [activeTab, setActiveTab] = useState('shop'); // Toggle between 'shop' and 'history'

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
        const userRes = await api.get(`/reports/summary/${user.id}`);
        setBalance(userRes.data.totalPoints);
        setHistory(userRes.data.purchaseHistory || []); // Assuming summary returns history

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
      setHistory(response.data.history);

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
      
      {/* Header & Balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
             <button 
                onClick={() => setActiveTab('shop')}
                style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'shop' ? '#3182ce' : 'white', color: activeTab === 'shop' ? 'white' : '#4a5568' }}>
                Shop
             </button>
             <button 
                onClick={() => setActiveTab('history')}
                style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'history' ? '#3182ce' : 'white', color: activeTab === 'history' ? 'white' : '#4a5568' }}>
                My History ({history.length})
             </button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          Balance: <span style={{ color: '#f59e0b', fontSize: '1.2em' }}>{loading ? '...' : balance.toLocaleString()} 🪙</span>
        </div>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>{activeTab === 'shop' ? 'Rewards Store 🎁' : 'Purchase History 📜'}</h1>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : activeTab === 'shop' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          {Array.isArray(products) && products.map(product => (
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
      ) : (
        /* History View */
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            {history.length === 0 ? <p style={{ textAlign: 'center' }}>No purchases yet!</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Item</th>
                            <th style={{ padding: '12px' }}>Price</th>
                            <th style={{ padding: '12px' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={{ padding: '12px' }}>{item.itemName}</td>
                                <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 'bold' }}>{item.pricePaid} 🪙</td>
                                <td style={{ padding: '12px', fontSize: '0.9em', color: '#718096' }}>{new Date(item.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
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