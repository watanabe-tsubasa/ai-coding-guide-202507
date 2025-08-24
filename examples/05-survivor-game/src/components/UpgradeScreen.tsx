import React from 'react';
import type { Upgrade } from '../types/game';

interface UpgradeScreenProps {
  upgrades: Upgrade[];
  onSelectUpgrade: (upgrade: Upgrade) => void;
}

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ upgrades, onSelectUpgrade }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      zIndex: 10,
    }}>
      <h2>Level Up!</h2>
      <h3>Choose an Upgrade</h3>
      <div style={{ display: 'flex', gap: '20px' }}>
        {upgrades.map((upgrade) => (
          <div
            key={upgrade.type}
            style={{
              border: '1px solid white',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onClick={() => onSelectUpgrade(upgrade)}
          >
            <h4>{upgrade.title}</h4>
            <p>{upgrade.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradeScreen;
