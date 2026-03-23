import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AgentSelector({ selected, onSelect }) {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.getAgents().then((list) => {
      setAgents(list);
      if (list.length > 0 && !selected) onSelect(list[0]);
    }).catch(console.error);
  }, []);

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>Agent</span>
      <select
        value={selected || ''}
        onChange={(e) => onSelect(e.target.value)}
        style={styles.select}
      >
        <option value="">All agents</option>
        {agents.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: 500,
  },
  select: {
    background: '#1f2937',
    color: '#f9fafb',
    border: '1px solid #374151',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
  },
};
