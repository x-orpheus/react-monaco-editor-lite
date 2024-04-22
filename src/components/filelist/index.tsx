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
    editSourceFolderName,
    getOldNewPath
} from '@utils/index';
import File from './file';
import './index.less';
import OpenFilePanel from './open-file-panel';

export interface FileTreeIProps {
    defaultFiles: any,
    openedFiles: any,
    getAllFiles: () => any,
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
    onCloseFile: (path: string) => void,
    rootEl: React.MutableRefObject<null>,
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
    getAllFiles,
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
    onCloseFile,
    rootEl,
    disableFileOps = {},
    disableFolderOps = {},
    openedFiles
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
            target: rootEl.current,
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
            const { newpath } = getOldNewPath(file.path, file.name);
            const files = getAllFiles();
            if (files[newpath] || files[newpath] === '') {
                tree = deleteSourceFile(filetree, file.path);
            } else {
                tree = deleteSourceFile(filetree, file.path);
                tree = addSourceFile(tree, file.path + file.name);
                setTimeout(() => {
                    onAddFile(file.path + file.name);
                }, 500);
            }
        } else {
            tree = deleteSourceFile(filetree, file.path);
        }
        setFiletree(tree);
    }, [filetree, onAddFile, getAllFiles]);

    const addFolder = useCallback((path: string) => {
        setFiletree(addSourceFolder(filetree, path));
    }, [filetree]);

    const deleteFolder = useCallback((path: string) => {
        Modal.confirm({
            target: rootEl.current,
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
            const {
                newpath,
            } = getOldNewPath(file.path, file.name);
            const filenames = Object.keys(getAllFiles());
            let exist = false;
            for (let i = 0; i < filenames.length; i++) {
                if (newpath === filenames[i]) {
                    exist = true;
                    break;
                } else if (filenames[i].startsWith(newpath + '/')) {
                    exist = true;
                    break;
                }
            }
            if (exist) {
                tree = deleteSourceFolder(filetree, file.path);
            } else {
                tree = deleteSourceFolder(filetree, file.path);
                tree = addSourceFolder(tree, file.path + file.name);
                onAddFolder(file.path + file.name);
            }
        } else {
            tree = deleteSourceFolder(filetree, file.path);
        }
        setFiletree(tree);
    }, [filetree, onAddFolder]);

    return (
        <div className="music-monaco-editor-list-wrapper" style={style}>
            <OpenFilePanel filetree={filetree} openedFiles={openedFiles} onPathChange={onPathChange} onCloseFile={onCloseFile} currentPath={currentPath}></OpenFilePanel>
            {
                title && (
                    <div className="music-monaco-editor-list-title">
                        <span style={{ flex: 1 }} className="music-monaco-editor-list-title-name">{title}</span>
                        {
                            disableFileOps.add ?  null : (
                                <AddFileIcon
                                    onClick={(e:Event) => {
                                        e.stopPropagation();
                                        addFile('/');
                                    }}
                                    className="music-monaco-editor-list-title-icon" />
                            )
                        }
                        {   
                            disableFolderOps.add ? null : (
                                <AddFolderIcon
                                    onClick={(e:Event) => {
                                        e.stopPropagation();
                                        addFolder('/');
                                    }}
                                    className="music-monaco-editor-list-title-icon" />
                            )
                        }
                    </div>
                )
            }
            <div className="music-monaco-editor-list-files">
                <File
                    getAllFiles={getAllFiles}
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
