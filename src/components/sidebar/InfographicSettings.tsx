import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { ColorPicker } from '../shared/ColorPicker';
import { RoleManager } from './RoleManager';

export const InfographicSettings: React.FC = () => {
    const { titleBar, backgroundColor } = useInfographicStore();
    const updateTitleBar = useInfographicStore((s) => s.updateTitleBar);
    const setBackgroundColor = useInfographicStore((s) => s.setBackgroundColor);

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-slate-800">Global Settings</h2>

            <div className="flex flex-col gap-4">
                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1">Title Bar</h3>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Main Title</label>
                    <input
                        type="text"
                        value={titleBar.text}
                        onChange={(e) => updateTitleBar({ text: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Subtitle</label>
                    <input
                        type="text"
                        value={titleBar.subtitle}
                        onChange={(e) => updateTitleBar({ subtitle: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <ColorPicker
                    label="Title Background"
                    color={titleBar.backgroundColor}
                    onChange={(color) => updateTitleBar({ backgroundColor: color })}
                />

                <ColorPicker
                    label="Title Text Color"
                    color={titleBar.textColor}
                    onChange={(color) => updateTitleBar({ textColor: color })}
                />

                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1 mt-2">Canvas</h3>

                <ColorPicker
                    label="Canvas Background"
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                />
                <RoleManager />
            </div>
        </div>
    );
};
