import { useState, useEffect } from 'react';
import TaskCard from "./components/TaskCard";
import ScoreCenter from './components/ScoreCenter';
import api from './services/api';

function Dashboard() {
  const [userData, setUserData] = useState({
    username: '',
    totalPoints: 0,
    stats: {
      reportPost: 0,
      safetyTips: 0,
      reportGood: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = 1;
        const response = await api.get(`/reports/summary/${userID}`);
        setUserData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async (actionType) => {
    try {
      const userID = 1;
      const response = await api.post('/reports', {
        userID: userID,
        action: actionType,
        description: `User performed ${actionType}`
      });

      setUserData(prev => ({
        ...prev,
        totalPoints: response.data.newTotalPoints,
        stats: response.data.newStats 
      }));

    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  return (
    <div style={{ 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      <h1 style={{ textAlign: 'center' }}>Hello, {userData.username}! 👋</h1>
      <h4 style={{ textAlign: 'center' }}>Thanks for making the internet a safer place</h4>
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-20px' }}>
          <TaskCard 
            title="Report Post" 
            score={userData.stats.reportPost || 0} 
            total={50} 
            color="#FF4D4D" 
            onUpdate={() => handleUpdate('reportPost')} 
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}> 
          <ScoreCenter score={userData.totalPoints} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-20px' }}>
          
          <TaskCard 
            title="Safety Tips" 
            score={userData.stats.safetyTips || 0} 
            total={25} 
            color="#FF9F1C" 
            onUpdate={() => handleUpdate('safetyTips')} 
          />
          
          <TaskCard 
            title="Report Good" 
            score={userData.stats.reportGood || 0} 
            total={30} 
            color="#00C851" 
            onUpdate={() => handleUpdate('reportGood')} 
          />
        </div>

        <h4 style={{ textAlign: 'center', marginTop: '40px' }}>Keep Going!</h4>
      </div>
    </div>
  );
}

export default Dashboard;