import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

export interface MarkdownSourceRendererProps {
  markdown: string;
  onChange?: (value: string) => void;
}

export default function MarkdownSourceRenderer({ markdown, onChange }: MarkdownSourceRendererProps) {
  const [localValue, setLocalValue] = useState(markdown);
  const isFocused = useRef(false);
  const updateMilkdownTimeout = useRef<NodeJS.Timeout | null>(null);

  // Only apply external markdown changes if the user is NOT actively typing here
  useEffect(() => {
    if (!isFocused.current && markdown !== localValue) {
      setLocalValue(markdown);
    }
  }, [markdown, localValue]);

  // Handle typing in Monaco
  const handleEditorChange = (val: string | undefined) => {
    if (val === undefined) return;
    setLocalValue(val);

    if (!isFocused.current) return;

    if (updateMilkdownTimeout.current) clearTimeout(updateMilkdownTimeout.current);
    updateMilkdownTimeout.current = setTimeout(() => {
      if (onChange) onChange(val);
    }, 400); // 400ms debounce
  };

  const handleMount: OnMount = (editor) => {
    editor.onDidFocusEditorText(() => {
      isFocused.current = true;
    });
    editor.onDidBlurEditorText(() => {
      isFocused.current = false;
      // Synchronize state from Milkdown to correct any drifts on blur
      setLocalValue((prev) => (markdown !== prev ? markdown : prev));
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden', border: '1px solid #ddd', borderRadius: '8px' }}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={localValue}
        onChange={handleEditorChange}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 14,
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </div>
  );
}
