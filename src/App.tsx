import React, { useState } from 'react';
import './App.css';

function App() {
  const [names, setNames] = useState(['', '', '']);
  const [winner, setWinner] = useState<string | null>(null);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const pickWinner = () => {
    const validNames = names.filter(name => name.trim() !== '');
    if (validNames.length === 0) {
      alert('少なくとも1つの名前を入力してください。');
      return;
    }
    const randomIndex = Math.floor(Math.random() * validNames.length);
    setWinner(validNames[randomIndex]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Random Picker</h1>
        <div className="input-container">
          {names.map((name, index) => (
            <input
              key={index}
              type="text"
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`名前 ${index + 1}`}
              className="name-input"
            />
          ))}
        </div>
        <button onClick={pickWinner} className="pick-button">
          抽選する
        </button>
        {winner && (
          <div className="result">
            <h2>当選者</h2>
            <p className="winner">{winner}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
