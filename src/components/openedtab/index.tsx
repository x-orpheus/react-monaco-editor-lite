import React from 'react';
import TabItem from './tabitem';
import './index.less';

type Files =  Array<{
    status?: string,
    path: string,
}>;

function dealFiles(files: Files) {
    const count:{[key: string]: number} = {};
    const resolvedFiles = files.map(file => {
        const path = file.path;
        const paths = path.split('/');
        const name = paths.slice(-1)[0];
        const pre = paths.slice(-2, -1)[0];
        const prefix = pre ? `.../${pre}` : './';
        return {
            name,
            prefix,
            ...file,
        };
    });

    resolvedFiles.forEach(file => {
        if (count[file.name]) {
            count[file.name] += 1;
        } else {
            count[file.name] = 1;
        }
    });

    return resolvedFiles.map(v => ({
        ...v,
        showPrefix: count[v.name] > 1,
    }));
}

const OpenedTab: React.FC<{
    openedFiles: Files,
    onPathChange?: (key: string) => void,
    currentPath?: string,
    onCloseFile: (path: string) => void,
    rootEl: React.MutableRefObject<null>,
    onSaveFile: (path: string) => void,
    onAbortSave: (path: string) => void,
    onCloseOtherFiles: (path: string) => void,
}> = ({
    openedFiles,
    onPathChange,
    currentPath,
    onCloseFile,
    rootEl,
    onSaveFile,
    onAbortSave,
    onCloseOtherFiles,
}) => {
    const files = dealFiles(openedFiles);

    return (
        <div className="music-monaco-editor-opened-tab-wrapper">
            <div className="music-monaco-editor-opened-tab">
                {
                    files.map(file => 
                        <TabItem
                            onSaveFile={onSaveFile}
                            onAbortSave={onAbortSave}
                            rootEl={rootEl}
                            onCloseFile={onCloseFile}
                            file={file}
                            key={file.path}
                            onPathChange={onPathChange}
                            currentPath={currentPath}
                            onCloseOtherFiles={onCloseOtherFiles}
                            />
                    )
                }
            </div>
        </div>
    )
}

export default OpenedTab;