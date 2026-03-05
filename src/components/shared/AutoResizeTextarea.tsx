import React, { useEffect, useRef } from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    minRows?: number;
}

export const AutoResizeTextarea: React.FC<Props> = ({
    value,
    onChange,
    minRows = 1,
    className = '',
    ...rest
}) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        const el = ref.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
        resize();
    }, [value]);

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            rows={minRows}
            className={`resize-none overflow-hidden px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 w-full leading-snug ${className}`}
            onInput={resize}
            {...rest}
        />
    );
};
