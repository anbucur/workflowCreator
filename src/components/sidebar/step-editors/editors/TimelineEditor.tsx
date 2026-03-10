import React from 'react';
import { Plus } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
}

interface TimelineData {
    events: TimelineEvent[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<TimelineData>) => void;
}

export const TimelineEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as TimelineData;

    return (
        <div className="flex flex-col gap-4">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Timeline Events</label>
            {(data.events || []).map((event: TimelineEvent, i: number) => (
                <div key={event.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Event {i + 1}</span>
                        <button
                            onClick={() => {
                                const newEvents = [...data.events];
                                newEvents.splice(i, 1);
                                updateData({ events: newEvents });
                            }}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                    <input
                        type="date"
                        value={event.date || ''}
                        onChange={(e) => {
                            const newEvents = [...data.events];
                            newEvents[i] = { ...event, date: e.target.value };
                            updateData({ events: newEvents });
                        }}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                    <AutoResizeTextarea
                        placeholder="Event title"
                        value={event.title}
                        onChange={(e) => {
                            const newEvents = [...data.events];
                            newEvents[i] = { ...event, title: e.target.value };
                            updateData({ events: newEvents });
                        }}
                    />
                    <AutoResizeTextarea
                        placeholder="Description"
                        value={event.description || ''}
                        onChange={(e) => {
                            const newEvents = [...data.events];
                            newEvents[i] = { ...event, description: e.target.value };
                            updateData({ events: newEvents });
                        }}
                        className="text-sm"
                    />
                </div>
            ))}
            <button
                onClick={() => updateData({ events: [...(data.events || []), { id: createId(), date: '', title: 'New Event', description: '' }] })}
                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                <Plus size={14} /> Add Event
            </button>
        </div>
    );
};
