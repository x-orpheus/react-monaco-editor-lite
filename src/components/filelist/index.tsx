import React, {
    useCallback,
    useState,
    useImperativeHandle,
} from 'react';
import AddFileIcon from '@components/icons/addfile';
import AddFolderIcon from '@components/icons/addfolder';
import Modal from '@components/modal';
import {
    generateFileTree,
    addSourceFile,
    deleteSourceFile,
    editSourceFileName,
    addSourceFolder,
    deleteSourceFolder,
    editSourceFolderName
} from '@utils/index';
import File from './file';
import './index.less';

export interface FileTreeIProps {
    defaultFiles: any,
    onPathChange: (key: string) => void,
    title?: string,
    currentPath?: string,
    style?: any,
    onAddFile: (...args: any) => void,
    onDeleteFile: (...args: any) => void,
    onEditFileName: (...args: any) => void,
    onAddFolder: (...args: any) => void,
    onDeleteFolder: (path: string) => void,
    onEditFolderName: (path: string, name: string) => void,
    rootEl: HTMLElement | null,
    disableFileOps?: {
        add?: boolean,
        delete?: boolean,
        rename?: boolean,
    },
    disableFolderOps?: {
        add?: boolean,
        delete?: boolean,
        rename?: boolean,
    },
}

export interface FileTreeRefType {
    refresh: (defaultFiles: any) => void,
}

const FileTree = React.forwardRef<FileTreeRefType, FileTreeIProps>(({
    defaultFiles,
    onPathChange,
    title,
    currentPath = '',
    style,
    onAddFile,
    onDeleteFile,
    onEditFileName,
    onAddFolder,
    onDeleteFolder,
    onEditFolderName,
    rootEl,
    disableFileOps = {},
    disableFolderOps = {},
} ,ref) => {
    const [filetree, setFiletree] = useState(() => generateFileTree(defaultFiles));

    useImperativeHandle(ref, () => ({
        refresh: (files) => setFiletree(generateFileTree(files)),
    }));

    const addFile = useCallback((path: string) => {
        setFiletree(addSourceFile(filetree, path));
    }, [filetree]);

    const deleteFile = useCallback((path: string) => {
        Modal.confirm({
            target: rootEl,
            okText: '删除',
            onOk: (close: () => void) => {
                setFiletree(deleteSourceFile(filetree, path));
                onDeleteFile(path);
                close();
            },
            title: '是否确实要删除本文件',
            content: () => (
                <div>
                    <div>删除后不可恢复</div>
                    <div>当前文件路径: {path}</div>
                </div>
            )
        });
    }, [filetree, onDeleteFile, rootEl]);

    const editFileName = useCallback((path: string, name: string) => {
        setFiletree(editSourceFileName(filetree, path, name));
        onEditFileName(path, name);
    }, [filetree, onEditFileName]);

    const handleConfirmAddFile = useCallback((file: any) => {
        let tree:any = {};
        if (file.name) {
            tree = deleteSourceFile(filetree, file.path);
            tree = addSourceFile(tree, file.path + file.name);
            onAddFile(file.path + file.name);
        } else {
            tree = deleteSourceFile(filetree, file.path);
        }
        setFiletree(tree);
    }, [filetree, onAddFile]);

    const addFolder = useCallback((path: string) => {
        setFiletree(addSourceFolder(filetree, path));
    }, [filetree]);

    const deleteFolder = useCallback((path: string) => {
        Modal.confirm({
            target: rootEl,
            okText: '删除',
            onOk: (close: () => void) => {
                setFiletree(deleteSourceFolder(filetree, path));
            onDeleteFolder(path);
                close();
            },
            title: '是否确实要删除此文件夹',
            content: () => (
                <div>
                    <div>文件夹删除后不可恢复，同时会删除子文件夹</div>
                    <div>当前文件路径: {path}</div>
                </div>
            )
        });
    }, [filetree, onDeleteFolder, rootEl]);

    const editFolderName = useCallback((path: string, name: string) => {
        setFiletree(editSourceFolderName(filetree, path, name));
        onEditFolderName(path, name);
    }, [filetree, onEditFolderName]);

    const handleConfirmAddFolder = useCallback((file: any) => {
        let tree:any = {};
        if (file.name) {
            tree = deleteSourceFolder(filetree, file.path);
            tree = addSourceFolder(tree, file.path + file.name);
            onAddFolder(file.path + file.name);
        } else {
            tree = deleteSourceFolder(filetree, file.path);
        }
        setFiletree(tree);
    }, [filetree, onAddFolder]);

    return (
        <div className="music-monaco-editor-list-wrapper" style={style}>
            {
                title && (
                    <div className="music-monaco-editor-list-title">
                        <span style={{ flex: 1 }}>{title}</span>
                        {
                            disableFileOps ? null: (
                                <>
                                    <AddFileIcon
                                        onClick={(e:Event) => {
                                            e.stopPropagation();
                                            addFile('/');
                                        }}
                                        className="music-monaco-editor-list-title-icon" />
                                    <AddFolderIcon
                                        onClick={(e:Event) => {
                                            e.stopPropagation();
                                            addFolder('/');
                                        }}
                                        className="music-monaco-editor-list-title-icon" />
                                </>
                            )
                        }
                    </div>
                )
            }
            <div className="music-monaco-editor-list-files">
                <File
                    disableFileOps={disableFileOps}
                    disableFolderOps={disableFolderOps}
                    onEditFileName={editFileName}
                    onEditFolderName={editFolderName}
                    onDeleteFile={deleteFile}
                    onDeleteFolder={deleteFolder}
                    onAddFile={addFile}
                    onAddFolder={addFolder}
                    onConfirmAddFile={handleConfirmAddFile}
                    onConfirmAddFolder={handleConfirmAddFolder}
                    currentPath={currentPath}
                    root
                    file={filetree}
                    onPathChange={onPathChange} />
            </div>
        </div>
    )
});

FileTree.displayName = 'filetree';

export default React.memo(FileTree);
