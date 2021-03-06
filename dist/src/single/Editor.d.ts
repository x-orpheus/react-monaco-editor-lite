import React from 'react';
import * as monacoType from 'monaco-editor';
export interface SingleEditorIProps {
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    onBlur?: (v: string) => void;
    width?: string;
    height?: string;
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
    style?: React.CSSProperties;
    options?: monacoType.editor.IStandaloneEditorConstructionOptions;
}
export interface SingleEditorRefType {
    getEditor: () => monacoType.editor.IStandaloneCodeEditor | null;
}
export declare const INITIAL_OPTIONS: monacoType.editor.IStandaloneEditorConstructionOptions;
export declare const SingleEditor: React.ForwardRefExoticComponent<SingleEditorIProps & React.RefAttributes<SingleEditorRefType>>;
export default SingleEditor;
