'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  caretChars?: React.ReactNode;
  label?: React.ReactNode;
  isBlink?: boolean;
}

export function Input({
  caretChars,
  label,
  isBlink = true,
  placeholder,
  onChange,
  type,
  id,
  className,
  ...rest
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [text, setText] = React.useState(rest.defaultValue?.toString() || rest.value?.toString() || '');
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectionStart, setSelectionStart] = React.useState(text.length);

  React.useEffect(() => {
    if (rest.value !== undefined) {
      const val = rest.value.toString();
      setText(val);
      setSelectionStart(val.length);
    }
  }, [rest.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    onChange?.(e);
    setSelectionStart(e.target.selectionStart ?? value.length);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget as HTMLInputElement;
    setSelectionStart(inputEl.selectionStart ?? text.length);
  };
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget as HTMLInputElement;
    inputEl.focus();
    setSelectionStart(inputEl.selectionStart ?? text.length);
  };

  const isPlaceholderVisible = !text && placeholder;
  const maskText = (t: string) => (type === 'password' ? '•'.repeat(t.length) : t);
  const beforeCaretText = isPlaceholderVisible ? placeholder ?? '' : maskText(text.substring(0, selectionStart));
  const afterCaretText = isPlaceholderVisible ? '' : maskText(text.substring(selectionStart));

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label htmlFor={inputId} className="block bg-border px-1 text-foreground">
          {label}
        </label>
      )}
      <div className={cn('block', isFocused && 'ring-1 ring-primary')}>        
        <div
          className={cn(
            'displayed overflow-hidden whitespace-nowrap pointer-events-none bg-background-input shadow-inner shadow-border',
            isPlaceholderVisible && 'italic text-muted-foreground'
          )}
        >
          {beforeCaretText}
          {!isPlaceholderVisible && (
            <span className={cn('block inline-block min-w-[1ch] bg-foreground text-background', isBlink && 'animate-pulse')}>{
              caretChars || ''
            }</span>
          )}
          {!isPlaceholderVisible && afterCaretText}
        </div>
        <input
          id={inputId}
          ref={inputRef}
          className="absolute inset-0 w-full text-transparent caret-transparent outline-none bg-transparent"
          value={text}
          aria-placeholder={placeholder}
          type={type}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onSelect={handleSelect}
          onClick={handleClick}
          {...rest}
        />
      </div>
    </div>
  );
}
