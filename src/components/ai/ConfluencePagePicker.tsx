import React, { useEffect, useState } from 'react';
import { useIntegrationsStore } from '../../store/useIntegrationsStore';
import { useAiChatStore } from '../../store/useAiChatStore';
import { useThemeStore } from '../../store/useThemeStore';
import type { DocumentContext } from '../../ai/types';
import { X, BookOpen, Loader2, Search, FileText } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const ConfluencePagePicker: React.FC<Props> = ({ onClose }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const { confluencePages, fetchConfluencePages, fetchConfluencePageContent } = useIntegrationsStore();
    const { setDocumentContext } = useAiChatStore();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingPageId, setLoadingPageId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetchConfluencePages().finally(() => setLoading(false));
    }, [fetchConfluencePages]);

    const filtered = confluencePages.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelect = async (pageId: string, title: string) => {
        setLoadingPageId(pageId);
        try {
            const result = await fetchConfluencePageContent(pageId);
            if (result) {
                const doc: DocumentContext = {
                    fileName: result.title || title,
                    fileType: 'confluence',
                    content: result.content,
                    charCount: result.content.length,
                    source: 'confluence',
                };
                setDocumentContext(doc);
                onClose();
            }
        } finally {
            setLoadingPageId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-500" />
                        <span className="font-semibold text-sm">Import from Confluence</span>
                    </div>
                    <button onClick={onClose} className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                        <Search size={14} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                        <input
                            type="text"
                            placeholder="Search pages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`flex-1 bg-transparent text-sm outline-none ${isDarkMode ? 'text-slate-200 placeholder-slate-500' : 'text-slate-700 placeholder-slate-400'}`}
                        />
                    </div>
                </div>

                {/* Pages list */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={20} className="animate-spin text-blue-500" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={`text-center py-8 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {search ? 'No matching pages' : 'No pages found'}
                        </div>
                    ) : (
                        filtered.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => handleSelect(page.id, page.title)}
                                disabled={loadingPageId === page.id}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${isDarkMode
                                    ? 'hover:bg-slate-800 text-slate-200'
                                    : 'hover:bg-slate-50 text-slate-700'
                                } ${loadingPageId === page.id ? 'opacity-60' : ''}`}
                            >
                                {loadingPageId === page.id ? (
                                    <Loader2 size={14} className="shrink-0 animate-spin text-blue-500" />
                                ) : (
                                    <FileText size={14} className={`shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{page.title}</div>
                                    {page.lastModified && (
                                        <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {new Date(page.lastModified).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
