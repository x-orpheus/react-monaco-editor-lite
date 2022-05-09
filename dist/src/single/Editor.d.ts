import React from 'react';
import * as monacoType from 'monaco-editor';
export interface EditorIProps {
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    onBlur?: (v: string) => void;
    loc?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    options?: monacoType.editor.IStandaloneEditorConstructionOptions;
}
export declare const INITIAL_OPTIONS: monacoType.editor.IStandaloneEditorConstructionOptions;
export declare const Editor: React.FC<EditorIProps>;
export default Editor;
