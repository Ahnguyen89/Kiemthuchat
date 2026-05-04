import React, { useEffect, useState } from 'react';
import { chatApi } from '@/lib/chat-api';
import type { User } from '@/types/chat';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (room: any) => void;
  currentUserId: string;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onClose, onCreated, currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const data = await chatApi.getAvailableUsers();
      setUsers(data.filter(u => u.id !== currentUserId));
    })();
    setSelected([]);
    setName('');
  }, [open, currentUserId]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return;
    setLoading(true);
    try {
  const room = await chatApi.createRoom({ name, type: 'GROUP', memberIds: selected });
  console.log('Created room:', room);
  setLoading(false);
  onCreated(room);
  onClose();
    } catch (err) {
      setLoading(false);
      alert('Tạo nhóm thất bại');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card p-4 rounded w-96">
        <h3 className="text-lg font-semibold mb-2">Tạo nhóm chat</h3>
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Tên nhóm"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="max-h-64 overflow-auto mb-4">
          {users.map(u => (
            <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
              <div>{u.name} ({u.email})</div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading || !name.trim() || selected.length === 0}>
            {loading ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
};
