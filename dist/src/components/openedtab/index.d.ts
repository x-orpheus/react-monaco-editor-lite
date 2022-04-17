import React from 'react';
import './index.less';
declare type Files = Array<{
    status?: string;
    path: string;
}>;
declare const OpenedTab: React.FC<{
    openedFiles: Files;
    onPathChange?: (key: string) => void;
    currentPath?: string;
    onCloseFile: (path: string) => void;
    rootEl: HTMLElement | null;
    onSaveFile: (path: string) => void;
    onAbortSave: (path: string) => void;
    onCloseOtherFiles: (path: string) => void;
}>;
export default OpenedTab;
