import React from 'react';

interface HeaderProps {
  currentRole: 'packer' | 'admin';
  onRoleChange: (role: 'packer' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  return (
    <header className="bg-amber-700 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
          Проверка качества хлеба
        </h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="role-select" className="text-sm font-medium text-white">Режим:</label>
          <select
            id="role-select"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as 'packer' | 'admin')}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50 text-sm py-1 pl-2 pr-8"
          >
            <option value="packer">Упаковщик</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
      </div>
    </header>
  );
};
