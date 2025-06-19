import React, { useState, useEffect } from 'react';
import './App.css';

interface NameGroup {
  id: string;
  name: string;
  names: string[];
}

function App() {
  const [names, setNames] = useState(['', '', '']);
  const [winner, setWinner] = useState<string | null>(null);
  const [groups, setGroups] = useState<NameGroup[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    const savedGroups = localStorage.getItem('nameGroups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const addNameField = () => {
    setNames([...names, '']);
  };

  const removeNameField = (index: number) => {
    if (names.length > 1) {
      const newNames = names.filter((_, i) => i !== index);
      setNames(newNames);
    }
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

  const createNewGroup = () => {
    setNames(['', '', '']);
    setNewGroupName('');
    setCurrentGroupId(null);
  };

  const saveGroup = () => {
    if (!newGroupName.trim()) {
      alert('グループ名を入力してください。');
      return;
    }

    const validNames = names.filter(name => name.trim() !== '');
    if (validNames.length === 0) {
      alert('少なくとも1つの名前を入力してください。');
      return;
    }

    let updatedGroups: NameGroup[];
    if (currentGroupId) {
      // 既存グループの更新
      updatedGroups = groups.map(group => 
        group.id === currentGroupId 
          ? { ...group, name: newGroupName, names: validNames }
          : group
      );
    } else {
      // 新規グループの作成
      const newGroup: NameGroup = {
        id: Date.now().toString(),
        name: newGroupName,
        names: validNames
      };
      updatedGroups = [...groups, newGroup];
    }

    setGroups(updatedGroups);
    localStorage.setItem('nameGroups', JSON.stringify(updatedGroups));
    setNewGroupName('');
    setCurrentGroupId(null);
    alert('グループを保存しました。');
  };

  const loadGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setNames(group.names);
      setCurrentGroupId(groupId);
      setNewGroupName(group.name);
    }
  };

  const deleteGroup = (groupId: string) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    localStorage.setItem('nameGroups', JSON.stringify(updatedGroups));
    if (currentGroupId === groupId) {
      setNames(['', '', '']);
      setCurrentGroupId(null);
      setNewGroupName('');
    }
  };

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  return (
    <div className="App">
      <div className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
        <div className="group-management">
          <div className="group-input">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="グループ名"
              className="group-name-input"
            />
            <div className="group-buttons">
              <button onClick={createNewGroup} className="new-group-button">
                新規作成
              </button>
              <button onClick={saveGroup} className="save-button">
                {currentGroupId ? '更新' : '保存'}
              </button>
            </div>
          </div>

          <div className="group-list">
            <h3>保存済みグループ</h3>
            {groups.map(group => (
              <div key={group.id} className="group-item">
                <button
                  onClick={() => loadGroup(group.id)}
                  className={`group-button ${currentGroupId === group.id ? 'active' : ''}`}
                >
                  {group.name}
                </button>
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="delete-button"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-content">
        <button 
          className={`menu-toggle ${isSideMenuOpen ? 'open' : ''}`} 
          onClick={toggleSideMenu}
        >
          {isSideMenuOpen ? '←' : '☰'}
        </button>

        <header className="App-header">
          <h1>Random Picker</h1>
          
          <div className="input-container">
            {names.map((name, index) => (
              <div key={index} className="name-input-wrapper">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`名前 ${index + 1}`}
                  className="name-input"
                />
                {names.length > 1 && (
                  <button
                    onClick={() => removeNameField(index)}
                    className="remove-name-button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button onClick={addNameField} className="add-name-button">
              + 名前を追加
            </button>
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
    </div>
  );
}

export default App;
