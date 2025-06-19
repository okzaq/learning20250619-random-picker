import React, { useState, useEffect } from 'react';
import './App.css';

interface NameGroup {
  id: string;
  name: string;
  names: string[];
}

interface NameItem {
  id: string;
  name: string;
  isSelected: boolean;
}

function App() {
  const [names, setNames] = useState(['', '', '']);
  const [nameItems, setNameItems] = useState<NameItem[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [winners, setWinners] = useState<string[]>([]);
  const [groups, setGroups] = useState<NameGroup[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(1);
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [showRanking, setShowRanking] = useState(true);

  useEffect(() => {
    const savedGroups = localStorage.getItem('nameGroups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    
    // 名前アイテムを初期化
    const initialNameItems = names.map((name, index) => ({
      id: index.toString(),
      name: name,
      isSelected: true
    }));
    setNameItems(initialNameItems);
  }, []);

  // 名前アイテムを更新
  useEffect(() => {
    const updatedNameItems = names.map((name, index) => ({
      id: index.toString(),
      name: name,
      isSelected: nameItems.find(item => item.id === index.toString())?.isSelected ?? true
    }));
    setNameItems(updatedNameItems);
  }, [names]);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleNameItemChange = (id: string, field: 'name' | 'isSelected', value: string | boolean) => {
    const updatedItems = nameItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setNameItems(updatedItems);
    
    // 名前の配列も更新
    if (field === 'name') {
      const newNames = [...names];
      const index = parseInt(id);
      newNames[index] = value as string;
      setNames(newNames);
    }
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

  const toggleAllNames = (isSelected: boolean) => {
    const updatedItems = nameItems.map(item => ({ ...item, isSelected }));
    setNameItems(updatedItems);
  };

  const pickWinner = () => {
    const validNameItems = nameItems.filter(item => item.name.trim() !== '' && item.isSelected);
    if (validNameItems.length === 0) {
      alert('少なくとも1つの名前を選択してください。');
      return;
    }
    
    if (isMultipleMode) {
      if (validNameItems.length < selectedCount) {
        alert(`選択された人数（${validNameItems.length}人）が抽選人数（${selectedCount}人）より少なくなっています。`);
        return;
      }
      
      const shuffled = [...validNameItems].sort(() => 0.5 - Math.random());
      const pickedWinners = shuffled.slice(0, selectedCount).map(item => item.name);
      setWinners(pickedWinners);
      setWinner(null);
    } else {
      const randomIndex = Math.floor(Math.random() * validNameItems.length);
      setWinner(validNameItems[randomIndex].name);
      setWinners([]);
    }
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
            {nameItems.map((item, index) => (
              <div key={item.id} className="name-input-wrapper">
                <input
                  type="checkbox"
                  checked={item.isSelected}
                  onChange={(e) => handleNameItemChange(item.id, 'isSelected', e.target.checked)}
                  className="name-checkbox"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleNameItemChange(item.id, 'name', e.target.value)}
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

          <div className="selection-controls">
            <div className="select-all-controls">
              <button onClick={() => toggleAllNames(true)} className="select-all-button">
                全員選択
              </button>
              <button onClick={() => toggleAllNames(false)} className="deselect-all-button">
                全員解除
              </button>
            </div>
          </div>

          <div className="lottery-controls">
            <div className="lottery-mode">
              <label>
                <input
                  type="checkbox"
                  checked={isMultipleMode}
                  onChange={(e) => setIsMultipleMode(e.target.checked)}
                />
                複数人抽選
              </label>
            </div>
            
            {isMultipleMode && (
              <>
                <div className="count-selector">
                  <label>
                    抽選人数:
                    <input
                      type="number"
                      min="1"
                      max={nameItems.filter(item => item.name.trim() !== '' && item.isSelected).length}
                      value={selectedCount}
                      onChange={(e) => setSelectedCount(parseInt(e.target.value) || 1)}
                      className="count-input"
                    />
                  </label>
                </div>
                <div className="ranking-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={showRanking}
                      onChange={(e) => setShowRanking(e.target.checked)}
                    />
                    順位を表示する
                  </label>
                </div>
              </>
            )}
          </div>

          <button onClick={pickWinner} className="pick-button">
            {isMultipleMode ? `${selectedCount}人を抽選` : '抽選する'}
          </button>
          
          {winner && (
            <div className="result">
              <h2>当選者</h2>
              <p className="winner">{winner}</p>
            </div>
          )}
          
          {winners.length > 0 && (
            <div className="result">
              <h2>当選者</h2>
              <div className="winners-list">
                {winners.map((winner, index) => (
                  <p key={index} className="winner-item">
                    {showRanking ? `${index + 1}位: ` : ''}{winner}
                  </p>
                ))}
              </div>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}

export default App;
