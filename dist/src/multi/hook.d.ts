import React from 'react';
import * as monacoType from 'monaco-editor';
export declare function useDragLine(num: number): [
    {
        width: string;
    },
    (e: any) => void,
    (e: any) => void,
    (e: any) => void
];
export declare function usePrettier(editorRef: React.MutableRefObject<monacoType.editor.IStandaloneCodeEditor | null>): [
    React.MutableRefObject<boolean>,
    (e: any) => void,
    () => Promise<void> | undefined
];
export declare function useInit(filesRef: React.MutableRefObject<{
    [key: string]: string | null;
}>, editorRef: React.MutableRefObject<monacoType.editor.IStandaloneCodeEditor | null>, options: monacoType.editor.IStandaloneEditorConstructionOptions, disableEslint?: boolean): void;
export declare function useEditor(editorRef: React.MutableRefObject<monacoType.editor.IStandaloneCodeEditor | null>, optionsRef: React.MutableRefObject<monacoType.editor.IEditorConstructionOptions>, openOrFocusPath: (path: string) => void): React.RefObject<HTMLDivElement>;
export declare const useVarRef: (param: any) => React.MutableRefObject<any>;
