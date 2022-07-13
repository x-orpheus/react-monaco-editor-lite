import React, { useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import * as monacoType from 'monaco-editor';
import { configTheme } from '@utils/initEditor';
export interface SingleEditorIProps {
    value?: string,
    defaultValue?: string,
    onChange?: (v: string) => void,
    onBlur?: (v: string) => void,
    width?: string,
    height?: string,
    loc?: {
        start: {
            line: number,
            column: number,
        },
        end: {
            line: number,
            column: number,
        }
    },
    style?: React.CSSProperties,
    options?: monacoType.editor.IStandaloneEditorConstructionOptions
}
export interface SingleEditorRefType {
    getEditor: () => monacoType.editor.IStandaloneCodeEditor | null;
}

export const INITIAL_OPTIONS:monacoType.editor.IStandaloneEditorConstructionOptions = {
    theme: 'GithubDarkDefault',
    fontSize: 14,
    tabSize: 2,
    fontFamily: 'Menlo, Monaco, Courier New, monospace',
    folding: true,
    minimap: {
      enabled: false,
    },
    autoIndent: 'advanced',
    contextmenu: true,
    useTabStops: true,
    wordBasedSuggestions: true,
    formatOnPaste: true,
    automaticLayout: true,
    lineNumbers: 'on',
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    fixedOverflowWidgets: false,
    snippetSuggestions: 'top',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
};

function getStringValue(value: any) {
    if (typeof value === 'undefined') {
        return value;
    }
    return String(value);
}

export const SingleEditor = React.forwardRef<SingleEditorRefType, SingleEditorIProps>(({
    value,
    defaultValue,
    onChange,
    onBlur,
    width = '100%',
    height = '100%',
    loc,
    style = {},
    options = {},
}, ref) => {
    const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
    const editorNodeRef = useRef<HTMLDivElement>(null);

    const valueRef = useRef(value);
    valueRef.current = value;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onBlurRef = useRef(onBlur);
    onBlurRef.current = onBlur;

    const modelRef = useRef<monacoType.editor.ITextModel | null>(null);

    useImperativeHandle(ref, () => ({
        getEditor: () => editorRef?.current,
    }));

    useEffect(() => {
        editorRef.current = window.monaco.editor.create(editorNodeRef.current!, {
            ...options,
            ...INITIAL_OPTIONS,
        });
        const model = window.monaco.editor.createModel(
            // value如果是number， 会报错
            getStringValue(valueRef.current) || getStringValue(defaultValue) || '',
            options?.language || 'javascript'
        );
        editorRef.current.setModel(model);

        modelRef.current = model;

        const sub = model.onDidChangeContent(() => {
            const v = model.getValue();
            if (v !== valueRef.current && onChangeRef.current) {
                onChangeRef.current(v);
            }
        });

        const blurSub = editorRef.current?.onDidBlurEditorText(() => {
            const v = editorRef.current?.getModel()?.getValue() || '';
            onBlurRef.current?.(v);
        });

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
            sub.dispose();
            blurSub.dispose();
            model.dispose();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 更新options
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions(options || {});
        }
    }, [options]);

    // 更新高亮区域
    const decorcations = useRef<any>(null);

    const locModel = useCallback((loc, forceCenter: boolean) => {
        if (loc) {
            const { start, end } = loc;
            decorcations.current = editorRef.current?.deltaDecorations(decorcations.current || [], [
              {
                range: new window.monaco.Range(start.line, start.column, end.line, end.column),
                options: { className: 'music-monaco-editor-highlight', isWholeLine: true },
              },
            ]);
            if (forceCenter) {
                editorRef.current?.revealLineInCenter(start.line);
            }
          }
    }, []);

    useEffect(() => {
        // 默认高亮用户选中的行
        locModel(loc, false);
    }, [loc, locModel]);

    // 更新model 语言
    useEffect(() => {
        if (options.language && modelRef.current) {
            window.monaco.editor.setModelLanguage(modelRef.current, options.language);
        }
    }, [options.language]);

    // 控制主题
    useEffect(() => {
        if (options.theme) {
            configTheme(options.theme);
        } else {
            configTheme('GithubLightDefault');
        }
    }, [options.theme])
    
    // 受控，外部改变，同步monaco
    useEffect(() => {
        // undefined，表示外界不受控，不做处理
        if (value === undefined) return;
        const model = editorRef.current?.getModel();
        if (value !== model?.getValue()) {
            // const viewState = editorRef.current?.saveViewState();
            // model?.pushEditOperations(
            //     [],
            //     [
            //         {
            //             range: model?.getFullModelRange(),
            //             text: value || '',
            //         },
            //     ],
            //     () => null
            // );
            model?.setValue(getStringValue(value) || '');
            // if (viewState) {
            //     editorRef.current?.restoreViewState(viewState);
            // }
            locModel(loc, true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, locModel]);

    return (
        <div
            ref={editorNodeRef}
            style={{
                width,
                height,
                ...style,
            }} />
    )
});

SingleEditor.displayName = 'SingleEditor';

export default SingleEditor;