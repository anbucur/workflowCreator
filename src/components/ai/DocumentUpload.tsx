import React, { useRef, useCallback, useState } from 'react';
import { useAiChatStore } from '../../store/useAiChatStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useIntegrationsStore } from '../../store/useIntegrationsStore';
import { parseCsv, formatFileSize } from '../../utils/csvParser';
import type { DocumentContext } from '../../ai/types';
import { FileText, X, Upload, Loader2, BookOpen } from 'lucide-react';

const ACCEPTED_TYPES = '.txt,.md,.csv,.tsv,.json';
const MAX_FILE_SIZE = 512 * 1024; // 500KB

interface Props {
    onPickConfluence?: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ onPickConfluence }) => {
    const { documentContext, setDocumentContext, clearDocumentContext } = useAiChatStore();
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const confluenceConnected = useIntegrationsStore((s) => s.isConnected('confluence'));
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processFile = useCallback(async (file: File) => {
        setError(null);
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large (${formatFileSize(file.size)}). Max 500KB.`);
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!['txt', 'md', 'csv', 'tsv', 'json'].includes(ext)) {
            setError('Unsupported file type. Use TXT, MD, CSV, TSV, or JSON.');
            return;
        }

        setLoading(true);
        try {
            const text = await file.text();
            let content = text;

            // For CSV/TSV, convert to markdown table
            if (ext === 'csv' || ext === 'tsv') {
                const parsed = parseCsv(text);
                content = `**File:** ${file.name} | **Rows:** ${parsed.rowCount} | **Columns:** ${parsed.columnCount}\n\n${parsed.markdown}`;
            }

            const doc: DocumentContext = {
                fileName: file.name,
                fileType: ext,
                content,
                charCount: content.length,
                source: 'upload',
            };
            setDocumentContext(doc);
        } catch {
            setError('Failed to read file.');
        } finally {
            setLoading(false);
        }
    }, [setDocumentContext]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        if (inputRef.current) inputRef.current.value = '';
    }, [processFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragOver(false), []);

    // If a document is loaded, show compact chip
    if (documentContext) {
        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${isDarkMode
                ? 'bg-purple-900/20 border-purple-700/50 text-purple-300'
                : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}>
                <FileText size={13} className="shrink-0" />
                <span className="truncate font-medium max-w-[160px]">{documentContext.fileName}</span>
                <span className={`shrink-0 ${isDarkMode ? 'text-purple-500' : 'text-purple-400'}`}>
                    {formatFileSize(documentContext.charCount)}
                </span>
                {documentContext.source === 'confluence' && (
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                        Confluence
                    </span>
                )}
                <button
                    onClick={clearDocumentContext}
                    className={`shrink-0 p-0.5 rounded transition-colors ${isDarkMode ? 'hover:bg-purple-800/50 text-purple-400' : 'hover:bg-purple-100 text-purple-500'}`}
                    title="Remove document"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer text-xs transition-all ${dragOver
                    ? isDarkMode ? 'border-purple-500 bg-purple-900/20 text-purple-300' : 'border-purple-400 bg-purple-50 text-purple-600'
                    : isDarkMode ? 'border-slate-700 hover:border-slate-600 text-slate-500 hover:text-slate-400' : 'border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-500'
                }`}
            >
                {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Upload size={14} />
                )}
                <span>{loading ? 'Reading...' : 'Upload document (TXT, MD, CSV, JSON)'}</span>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="hidden"
            />
            {confluenceConnected && onPickConfluence && (
                <button
                    onClick={onPickConfluence}
                    className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${isDarkMode
                        ? 'border-slate-700 hover:border-blue-700 text-slate-500 hover:text-blue-400 hover:bg-blue-900/20'
                        : 'border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                    <BookOpen size={13} />
                    Import from Confluence
                </button>
            )}
            {error && (
                <div className={`text-[11px] px-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</div>
            )}
        </div>
    );
};
