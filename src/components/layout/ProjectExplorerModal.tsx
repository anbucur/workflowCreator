import React, { useEffect, useState } from 'react';
import { X, Clock, Trash2, Plus, MonitorPlay } from 'lucide-react';
import { useInfographicStore } from '../../store/useInfographicStore';

export interface ProjectEntry {
    id: string;
    name: string;
    updated_at: number;
}

interface Props {
    onClose: () => void;
}

export const ProjectExplorerModal: React.FC<Props> = ({ onClose }) => {
    const [projects, setProjects] = useState<ProjectEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const loadInfographic = useInfographicStore(s => s.loadInfographic);
    const currentId = useInfographicStore(s => s.id);
    const resetToDefault = useInfographicStore(s => s.resetToDefault);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5173/api/projects');
            const data = await res.json();
            setProjects(data);
        } catch (e) {
            console.error('Failed to fetch projects', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleLoad = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5173/api/projects/${id}`);
            const data = await res.json();
            loadInfographic(data);
            onClose();
        } catch (e) {
            console.error('Failed to load project', e);
            alert('Failed to load project from database.');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await fetch(`http://localhost:5173/api/projects/${id}`, { method: 'DELETE' });
            if (id === currentId) {
                resetToDefault();
            }
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const handleNewProject = () => {
        resetToDefault();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Project Explorer</h2>
                        <p className="text-sm text-slate-500">Manage your saved workflows</p>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close"
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">All Projects</h3>
                        <button
                            onClick={handleNewProject}
                            className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} /> New Project
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-400 py-12">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center text-slate-400 py-12">No projects found.</div>
                    ) : (
                        <div className="grid gap-3">
                            {projects.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleLoad(p.id)}
                                    className={`bg-white border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group ${p.id === currentId ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl flex-shrink-0 ${p.id === currentId ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                            <MonitorPlay size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{p.name || 'Untitled Project'}</h4>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                                                <Clock size={12} />
                                                Last updated: {new Date(p.updated_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {p.id !== currentId && (
                                            <button
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                onClick={(e) => handleDelete(e, p.id)}
                                                title="Delete Project"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        {p.id === currentId && (
                                            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
