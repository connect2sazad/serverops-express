import { useState } from "react";

export default function TagsInput({
    value = [],
    onChange,
    disabled = false,
    maxTags = 20,
    error = '',
}) {

    const [input, setInput] = useState('');

    const addTag = rawValue => {
        const tag = rawValue.trim();

        if (!tag) {
            setInput('');
            return;
        }

        const duplicate = value.some(
            current => current.toLowerCase() === tag.toLowerCase()
        );

        if (duplicate || value.length >= maxTags) {
            setInput('');
            return;
        }

        onChange([...value, tag]);
        setInput('');
    };

    const removeTag = tagToRemove => {
        onChange(
            value.filter(tag => tag !== tagToRemove)
        );
    };

    const handleKeyDown = e => {
        if (
            e.key === 'Enter' || e.key === ','
        ) {
            e.preventDefault();
            addTag(input);
        }

        if (
            e.key === 'Backspace' && input === '' && value.length > 0
        ) {
            removeTag(value[value.length - 1])
        }
    }

    return (
        <div>
            <div
                className={`form-control d-flex flex-wrap align-items-center gap-2 ${error ? 'is-invalid' : ''}`}
                onMouseDown={e => {
                    if (e.target === e.currentTarget) {
                        e.currentTarget
                            .querySelector('input')
                            ?.focus()
                    }
                }}
            >
                {value.map(tag => (
                    <span
                        key={tag}
                        className="badge rounded-pill text-bg-primary d-flex align-items-center gap-1"
                    >
                        {tag}

                        <button type="button" className="btn-close btn-close-white"
                            aria-label={`Remove ${tag}`} disabled={disabled}
                            onClick={() => removeTag(tag)}
                            style={{
                                fontSize: '0.55rem'
                            }}
                        />
                    </span>
                ))}

                <input type="text" className="border-0 flex-grow-1" 
                    style={{ outline: 'none', minWidth: '120px' }}
                    value={input}
                    disabled={disabled || value.length >= maxTags}
                    placeholder={value.length === 0 ? 'Type a tag and press Enter' : ''}
                    maxLength={50}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addTag(input)}
                />
            </div>

            {error ? (
                <div className="invalid-feedback d-block">
                    {error}
                </div>
            ): (
                <div className="form-text">
                    Please Enter or comma to add a tag. Maximum {maxTags}.
                </div>
            )}
        </div>
    );

}