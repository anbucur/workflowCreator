import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, Clock, Trash2, Plus, MonitorPlay, ExternalLink, Check, Search, ArrowUpDown, FileText, AlertCircle } from 'lucide-react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useProjectTabsStore } from '../../store/useProjectTabsStore';
import { createPlaceholderThumbnail } from '../../utils/thumbnail';

export interface ProjectEntry {
    id: string;
    name: string;
    updated_at: number;
}

interface Props {
    onClose: () => void;
}

type SortOption = 'updated' | 'name_asc' | 'name_desc';

export const ProjectExplorerModal: React.FC<Props> = ({ onClose }) => {
    const [projects, setProjects] = useState<ProjectEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('updated');
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const loadInfographic = useInfographicStore(s => s.loadInfographic);
    const currentId = useInfographicStore(s => s.id);
    const resetToDefault = useInfographicStore(s => s.resetToDefault);
    const openProjects = useProjectTabsStore(s => s.openProjects);
    const getSnapshot = useInfographicStore(s => s.getSnapshot);

    const isProjectOpen = (projectId: string) => openProjects.some(p => p.id === projectId);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let filtered = projects;
        
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = projects.filter(p => 
                p.name.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'updated':
                default:
                    return b.updated_at - a.updated_at;
            }
        });
        
        return sorted;
    }, [projects, searchQuery, sortBy]);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data);
        } catch (e) {
            console.error('Failed to fetch projects', e);
            setError('Unable to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        // Focus search input on mount
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleLoad = async (id: string, openInNewTab: boolean = false) => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            
            // Get latest state directly from store to avoid stale closures
            const tabsState = useProjectTabsStore.getState();
            const { openProjects: currentOpenProjects, openProject: openProjectFn, switchToProject: switchFn, updateProjectData } = tabsState;
            
            // Check if project is already open in a tab
            const existingTab = currentOpenProjects.find(p => p.id === id);
            
            if (existingTab) {
                // Project is already open - just switch to it
                const currentData = getSnapshot();
                const currentProject = currentOpenProjects.find(p => p.id === currentId);
                if (currentProject) {
                    // Update current tab data before switching
                    updateProjectData(currentId, currentData);
                }
                // Switch to the existing tab
                switchFn(id, currentData);
                // Load the project data
                loadInfographic(data);
            } else if (openInNewTab || currentOpenProjects.length > 0) {
                // Open in new tab - save current project state first
                const currentData = getSnapshot();
                const currentProject = currentOpenProjects.find(p => p.id === currentId);
                if (currentProject) {
                    // Update current tab data
                    updateProjectData(currentId, currentData);
                }
                // Open in new tab
                const thumbnail = createPlaceholderThumbnail(data.name || 'Untitled');
                openProjectFn(data, thumbnail);
                // Load the project data
                loadInfographic(data);
            } else {
                // No tabs yet - just load the project (tab will be created by Toolbar effect)
                loadInfographic(data);
            }
            onClose();
        } catch (e) {
            console.error('Failed to load project', e);
            alert('Failed to load project from database.');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if (!confirm(`Delete "${name || 'Untitled Project'}"? This action cannot be undone.`)) return;
        
        setDeletingId(id);
        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (id === currentId) {
                resetToDefault();
            }
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleNewProject = () => {
        resetToDefault();
        onClose();
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'name_asc': return 'Name (A-Z)';
            case 'name_desc': return 'Name (Z-A)';
            case 'updated': return 'Last Updated';
        }
    };

    const cycleSort = () => {
        const options: SortOption[] = ['updated', 'name_asc', 'name_desc'];
        const currentIndex = options.indexOf(sortBy);
        setSortBy(options[(currentIndex + 1) % options.length]);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Project Explorer</h2>
                                <p className="text-sm text-slate-500">{projects.length} project{projects.length !== 1 ? 's' : ''} • Press Esc to close</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            title="Close (Esc)"
                            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    {/* Search and Actions Bar */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        
                        <button
                            onClick={cycleSort}
                            className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all min-w-[140px] justify-center"
                            title="Change sort order"
                        >
                            <ArrowUpDown size={14} />
                            {getSortLabel()}
                        </button>
                        
                        <button
                            onClick={handleNewProject}
                            className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-primary/20"
                        >
                            <Plus size={18} /> New Project
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-red-700 font-medium">{error}</p>
                                <button onClick={fetchProjects} className="text-red-600 text-sm underline mt-1 hover:text-red-800">
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !error && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-10 h-10 border-3 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 text-sm">Loading projects...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">No projects yet</h3>
                            <p className="text-slate-500 text-sm mb-4">Create your first workflow to get started</p>
                            <button
                                onClick={handleNewProject}
                                className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Create Project
                            </button>
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">No results found</h3>
                            <p className="text-slate-500 text-sm">Try a different search term</p>
                        </div>
                    )}

                    {/* Projects Grid */}
                    {!loading && !error && filteredProjects.length > 0 && (
                        <div className="grid gap-3">
                            {filteredProjects.map(p => {
                                const projectIsOpen = isProjectOpen(p.id);
                                const isActive = p.id === currentId;
                                const isDeleting = deletingId === p.id;
                                
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => handleLoad(p.id)}
                                        onDoubleClick={() => handleLoad(p.id, true)}
                                        className={`bg-white border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-sm group
                                            ${isActive 
                                                ? 'border-primary ring-2 ring-primary/10 bg-primary/5' 
                                                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                                            }
                                            ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Icon */}
                                            <div className={`p-3 rounded-xl flex-shrink-0 transition-colors
                                                ${isActive 
                                                    ? 'bg-primary text-white' 
                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                                }`}
                                            >
                                                <MonitorPlay size={20} />
                                            </div>
                                            
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-slate-800 truncate">{p.name || 'Untitled Project'}</h4>
                                                    {projectIsOpen && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                                                            <Check size={10} /> Open
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                    <Clock size={12} />
                                                    {formatDate(p.updated_at)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center gap-1 ml-4">
                                            {!isActive && (
                                                <>
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                                                        onClick={(e) => { e.stopPropagation(); handleLoad(p.id, true); }}
                                                        title="Open in New Tab"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                                                        onClick={(e) => handleDelete(e, p.id, p.name)}
                                                        title="Delete Project"
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {isActive && (
                                                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
                    <span>Double-click to open in new tab</span>
                    <span>Tip: Use the search to quickly find projects</span>
                </div>
            </div>
        </div>
    );
};