import React, { useState } from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useThemeStore } from '../../store/useThemeStore';
import { ColorPicker } from '../shared/ColorPicker';
import { Plus, Trash2 } from 'lucide-react';

export const RoleManager: React.FC = () => {
    const roles = useInfographicStore((s) => s.roles);
    const addRole = useInfographicStore((s) => s.addRole);
    const removeRole = useInfographicStore((s) => s.removeRole);
    const updateRole = useInfographicStore((s) => s.updateRole);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

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
            <label className={`text-[10px] font-bold uppercase tracking-wider mt-4 transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Role Manager</label>

            <div className="flex flex-col gap-1.5">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors group border ${isDarkMode ? 'hover:bg-slate-800 border-transparent hover:border-slate-600' : 'hover:bg-slate-50 border-transparent hover:border-slate-200'}`}
                    >
                        {/* Color swatch only — no hex text */}
                        <div className="shrink-0">
                            <ColorPicker
                                color={role.color}
                                onChange={(color) => updateRole(role.id, { color })}
                            />
                        </div>

                        {/* Role tag */}
                        <input
                            title="Role Tag (Abbreviation)"
                            type="text"
                            maxLength={4}
                            value={role.tag !== undefined ? role.tag : role.name.substring(0, 3).toUpperCase()}
                            onChange={(e) => updateRole(role.id, { tag: e.target.value.toUpperCase() })}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    updateRole(role.id, { tag: undefined });
                                }
                            }}
                            className={`w-12 text-center text-xs font-bold uppercase tracking-widest border rounded px-1 transition-colors placeholder:text-slate-500 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 focus:bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-100/50 hover:bg-slate-200 focus:bg-white border-transparent text-slate-800'}`}
                            placeholder="TAG"
                        />

                        {/* Role name — takes all remaining space */}
                        <input
                            title="Role Name"
                            type="text"
                            value={role.name}
                            onChange={(e) => updateRole(role.id, { name: e.target.value })}
                            className={`flex-1 min-w-0 font-semibold text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 truncate transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                            placeholder="Role name…"
                        />

                        {/* Delete — appears on hover */}
                        <button
                            onClick={() => removeRole(role.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-colors p-1 shrink-0 ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                            title="Delete Role"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                {roles.length === 0 && (
                    <div className={`text-xs italic text-center py-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
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
                    className={`w-full border rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                />
                <button
                    type="submit"
                    disabled={!newRoleName.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed rounded-lg transition-all text-xs font-bold uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-slate-600 text-slate-500 hover:text-purple-400 hover:border-purple-500 disabled:hover:text-slate-500 disabled:hover:border-slate-600' : 'border-slate-200 text-slate-400 hover:text-primary hover:border-primary disabled:hover:text-slate-400 disabled:hover:border-slate-200'}`}
                >
                    <Plus size={16} /> Add New Role
                </button>
            </form>
        </div>
    );
};
