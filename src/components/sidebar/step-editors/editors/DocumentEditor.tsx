import React from 'react';
import { useThemeStore } from '../../../../store/useThemeStore';
import type { Step, DocumentData, DocumentItem } from '../../../../types';
import { Plus, X } from 'lucide-react';
import { nanoid } from 'nanoid';

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<DocumentData>) => void;
}

const DOC_TYPES = [
    { value: 'spec', label: 'Specification' },
    { value: 'template', label: 'Template' },
    { value: 'report', label: 'Report' },
    { value: 'diagram', label: 'Diagram' },
    { value: 'code', label: 'Code' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
];

export const DocumentEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as DocumentData;

    const addDocument = () => {
        const newDoc: DocumentItem = {
            id: nanoid(),
            name: '',
            docType: 'spec',
        };
        updateData({ documents: [...(data.documents || []), newDoc] });
    };

    const updateDocument = (index: number, updates: Partial<DocumentItem>) => {
        const newDocuments = [...(data.documents || [])];
        newDocuments[index] = { ...newDocuments[index], ...updates };
        updateData({ documents: newDocuments });
    };

    const removeDocument = (index: number) => {
        const newDocuments = (data.documents || []).filter((_, i) => i !== index);
        updateData({ documents: newDocuments });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Documents</label>
                <button
                    onClick={addDocument}
                    className={`p-1 rounded transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    title="Add document"
                >
                    <Plus size={14} />
                </button>
            </div>
            
            <div className="flex flex-col gap-3">
                {(data.documents || []).map((doc, index) => (
                    <div key={doc.id} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Document {index + 1}
                            </span>
                            <button
                                onClick={() => removeDocument(index)}
                                className={`p-1 rounded transition-colors ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                                title="Remove document"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1.5">
                                <label className={`text-[10px] font-medium uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={doc.name || ''}
                                    onChange={(e) => updateDocument(index, { name: e.target.value })}
                                    placeholder="Document name"
                                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className={`text-[10px] font-medium uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Type
                                </label>
                                <select
                                    value={doc.docType || 'spec'}
                                    onChange={(e) => updateDocument(index, { docType: e.target.value })}
                                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-900 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                >
                                    {DOC_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
                
                {(data.documents || []).length === 0 && (
                    <p className={`text-xs text-center py-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        No documents added yet. Click + to add one.
                    </p>
                )}
            </div>
        </div>
    );
};