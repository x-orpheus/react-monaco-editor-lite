import React from 'react';
import './index.less';
export interface FileTreeIProps {
    defaultFiles: any;
    onPathChange: (key: string) => void;
    title?: string;
    currentPath?: string;
    style?: any;
    onAddFile: (...args: any) => void;
    onDeleteFile: (...args: any) => void;
    onEditFileName: (...args: any) => void;
    onAddFolder: (...args: any) => void;
    onDeleteFolder: (path: string) => void;
    onEditFolderName: (path: string, name: string) => void;
    rootEl: HTMLElement | null;
}
export interface FileTreeRefType {
    refresh: (defaultFiles: any) => void;
}
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<FileTreeIProps & React.RefAttributes<FileTreeRefType>>>;
export default _default;
