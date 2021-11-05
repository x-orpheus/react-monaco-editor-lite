import React, { useCallback, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface fileObj {
    [key: string]: string,
}

// 初始化各个文件
function initializeFile(path: string, value: string) {
    // model 是否存在
    let model = monaco.editor
      .getModels()
      .find(model => model.uri.path === path);

    if (model) {
        // 存在，则比较value是否不同
        if (model.getValue() !== value) {
            // 不同，则更新
            // 采用这种方法才能保留 undo/redo
            model.pushEditOperations(
                [],
                [
                    {
                        range: model!.getFullModelRange(),
                        text: value,
                    },
                ],
                () => [],
            );
        }
    } else {
        // 否则，创建新的model
        model = monaco.editor.createModel(
            value,
            // TODO:根据输入文件后缀选择语言
            'javascript',
            new monaco.Uri().with({ path })
        );
    }
}

// 存储各个文件的状态
const editorStates = new Map();

// TODO:删除model

// TODO:重命名model

const Editor: React.FC<{
    path: string,
    files: fileObj,
    value: string,
    onValueChange: (v: string) => void,
    onPathChange: (key: string, value: string) => void,
    options: monaco.editor.IStandaloneEditorConstructionOptions
}> = ({
    path,
    files,
    value,
    onValueChange,
    options,
    onPathChange,
}) => {
    const editorNodeRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const prePath = useRef<string | null>(path);

    useEffect(() => {
        // 创建editor 实例
        editorRef.current = monaco.editor.create(editorNodeRef.current!, options);

        return () => {
            // 销毁实例
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        }
    }, []);

    useEffect(() => {
        // 创建各个文件model
        Object.keys(files).forEach(key => initializeFile(key, files[key]));
    }, [files]);

    useEffect(() => {
        // 先创建 or 更新model内容
        initializeFile(path, value);
        // path切换，存储上一个path编辑状态
        if (path !== prePath.current) {
            editorStates.set(prePath.current, editorRef.current?.saveViewState());
        }
        // 获取当前model
        const model = monaco.editor
            .getModels()
            .find(model => model.uri.path === path);
        let sub: monaco.IDisposable;
        if (model && editorRef.current) {
            // 设置editor实例使用当前model
            editorRef.current.setModel(model);
            // 如果path改变，那么恢复上一次的状态
            if (path !== prePath.current) {
                const editorState = editorStates.get(path);
                if (editorState) {
                    editorRef.current?.restoreViewState(editorState);
                }
                // 聚焦editor
                editorRef.current?.focus();
            }
            // 监听editor内容改变
            sub = model.onDidChangeContent(() => {
                const v = model.getValue();    
                // 受控        
                onValueChange(v);
            })
        }
        // 更新上一次的path
        prePath.current = path;
        return () => {
            if (sub.dispose) {
                // 销毁监听
                sub.dispose();
            }
        }
    }, [path, value]);

    useEffect(() => {
        if (editorRef.current) {
            // 同步editor options改变
            editorRef.current.updateOptions(options);
        }
    }, [options]);

    const handlePathChange = useCallback((e) => {
        const key = e.currentTarget.dataset.src!;
        onPathChange(key, files[key]);
    }, [files, onPathChange]);

    return (
        <div className="music-monaco-editor">
            <ul className="music-manaco-editor-tree">
                {
                    Object.keys(files).map(v => <li data-src={v} onClick={handlePathChange} key={v}>{v}</li>)
                }
            </ul>
            <div ref={editorNodeRef} style={{ width: '800px', height: '600px' }} />
        </div>
    )
};

export default Editor;