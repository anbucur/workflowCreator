import React, { useState } from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { ColorPicker } from '../shared/ColorPicker';
import { Plus, Trash2 } from 'lucide-react';

export const RoleManager: React.FC = () => {
    const roles = useInfographicStore((s) => s.roles);
    const addRole = useInfographicStore((s) => s.addRole);
    const removeRole = useInfographicStore((s) => s.removeRole);
    const updateRole = useInfographicStore((s) => s.updateRole);

    const [newRoleName, setNewRoleName] = useState('');

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoleName.trim()) {
            addRole(newRoleName.trim(), '#94a3b8');
            setNewRoleName('');
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4">Role Manager</label>

            <div className="flex flex-col gap-1.5">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors group border border-transparent hover:border-slate-200"
                    >
                        {/* Color swatch only — no hex text */}
                        <div className="shrink-0">
                            <ColorPicker
                                color={role.color}
                                onChange={(color) => updateRole(role.id, { color })}
                            />
                        </div>

                        {/* Role name — takes all remaining space */}
                        <input
                            title="Role Name"
                            type="text"
                            value={role.name}
                            onChange={(e) => updateRole(role.id, { name: e.target.value })}
                            className="flex-1 min-w-0 font-semibold text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 text-slate-800 truncate"
                            placeholder="Role name…"
                        />

                        {/* Delete — appears on hover */}
                        <button
                            onClick={() => removeRole(role.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0"
                            title="Delete Role"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                {roles.length === 0 && (
                    <div className="text-xs text-slate-500 italic text-center py-2">
                        No roles defined yet.
                    </div>
                )}
            </div>

            <form onSubmit={handleAddRole} className="flex flex-col mt-1 gap-2">
                <input
                    title="New Role Name"
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="New role name…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <button
                    type="submit"
                    disabled={!newRoleName.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-primary hover:border-primary transition-all text-xs font-bold uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-200"
                >
                    <Plus size={16} /> Add New Role
                </button>
            </form>
        </div>
    );
};
