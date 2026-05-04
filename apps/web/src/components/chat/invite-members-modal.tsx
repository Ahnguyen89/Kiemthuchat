'use client';

import React, { useEffect, useState } from 'react';
import { chatApi } from '@/lib/chat-api';
import { useSocket } from '@/contexts/socket-context';
import type { User } from '@/types/chat';

interface InviteMembersModalProps {
  roomId: string;
  open: boolean;
  onClose: () => void;
}

export const InviteMembersModal: React.FC<InviteMembersModalProps> = ({ roomId, open, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket() || { socket: null };

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await chatApi.getAvailableUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    })();
  }, [open]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleInvite = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      if (socket) {
        socket.emit('room:add_members', { roomId, userIds: selected }, (res: any) => {
          setLoading(false);
          if (res?.error) {
            console.error(res.error);
            return;
          }
          onClose();
        });
      } else {
        // fallback to REST
        await chatApi.addRoomMembers(roomId, selected);
        setLoading(false);
        onClose();
      }
    } catch (err) {
      setLoading(false);
      console.error('Invite failed', err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card p-4 rounded w-96">
        <h3 className="text-lg font-semibold mb-2">Mời thành viên</h3>
        <div className="max-h-64 overflow-auto mb-4">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
              <div>{u.name} ({u.email})</div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="btn btn-primary" onClick={handleInvite} disabled={loading || selected.length===0}>
            {loading ? 'Đang mời...' : 'Mời'}
          </button>
        </div>
      </div>
    </div>
  );
};
