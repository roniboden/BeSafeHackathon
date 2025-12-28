import { useState } from 'react';
import TaskCard from "./components/TaskCard";
import ScoreCenter from './components/ScoreCenter';

function App() {
  const [totalScore, setTotalScore] = useState(1247);

  const addPoints = () => {
    setTotalScore(prevScore => prevScore + 10);
  };

  return (
    <div style={{ 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      <h1 style={{ textAlign: 'center' }}>Hello, Noa!</h1>
      <h4 style={{ textAlign: 'center' }}>Thanks for making the internet a safer place</h4>

      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-20px' }}>
          <TaskCard 
            title="Harmful Posts" 
            score={12} 
            total={50} 
            color="#FF4D4D" 
            onUpdate={addPoints} 
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}> 
          <ScoreCenter score={totalScore} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-20px' }}>
          <TaskCard 
            title="Unsafe Accounts" 
            score={8} 
            total={25} 
            color="#FF9F1C" 
            onUpdate={addPoints} 
          />
          <TaskCard 
            title="Safety Tasks" 
            score={15} 
            total={30} 
            color="#00C851" 
            onUpdate={addPoints} 
          />
        </div>

        <h4 style={{ textAlign: 'center' }}>Keep Going!</h4>
        <h5 style={{ textAlign: 'center' }}>Every positive action counts. Your efforts help create a more respectful and safe online community for everyone.</h5>

      </div>
    </div>
  );
}

export default App;