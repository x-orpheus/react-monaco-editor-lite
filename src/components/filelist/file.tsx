import { useState, useRef, useCallback, useEffect, useMemo, MouseEvent } from 'react';
import Icon from '@components/icons';
import Arrow from '@components/icons/arrow';
import DeleteIcon from '@components/icons/delete';
import EditIcon from '@components/icons/edit';
import AddFileIcon from '@components/icons/addfile';
import AddFolderIcon from '@components/icons/addfolder';
import { getOldNewPath } from '@utils';

const File: React.FC<{
    getAllFiles: () => any,
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
    file: any,
    onPathChange: (key: string) => void,
    root: boolean,
    currentPath?: string,
    useFileMenu?: boolean,
    onAddFile: (...args: any[]) => void,
    onConfirmAddFile: (...args: any[]) => void,
    onDeleteFile: (...args: any[]) => void,
    onEditFileName: (...args: any[]) => void,
    onConfirmAddFolder: (...args: any[]) => void,
    onAddFolder: (...args: any[]) => void,
    onDeleteFolder: (...args: any[]) => void,
    onEditFolderName: (...args: any[]) => void,
    onContextMenu: (e: any, fileAction:(action:string, path: string, isFile: boolean) => void) => void
    onClickItem?: (file: any) => void,
}> = ({
    getAllFiles,
    disableFileOps = {},
    disableFolderOps = {},
    file,
    onPathChange,
    currentPath = '',
    root,
    useFileMenu = true,
    onAddFile,
    onConfirmAddFile,
    onDeleteFile,
    onEditFileName,
    onConfirmAddFolder,
    onAddFolder,
    onDeleteFolder,
    onEditFolderName,
    onContextMenu,
    onClickItem,
}) => {
    const [showChild, setShowChild] = useState(false);
    const [editing, setEditing] = useState(false);
    const nameRef = useRef<HTMLDivElement>(null);

    const handleDirectoryClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        onClickItem?.({
            path: e.currentTarget?.dataset?.src,
            isFile: false,
        });
        setShowChild((pre:boolean) => !pre);
    }, [onClickItem]);

    const handleFileClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        onClickItem?.({
            path: e.currentTarget?.dataset?.src,
            isFile: true,
        });
        const key = e.currentTarget.dataset.src!;
        onPathChange(key);
    }, [onPathChange, onClickItem]);

    const [showError, setShowError] = useState('');

    const handleBlur = useCallback(() => {
        setShowError('');
        const name = nameRef.current?.textContent;
        if (editing) {
            setEditing(false);
            if (file.name !== name) {
                if (file._isDirectory) {
                    onEditFolderName(file.path, name);
                } else if (name) {
                    const {
                        newpath,
                    } = getOldNewPath(file.path, name);
                    const files = getAllFiles();
                    if (!files[newpath]) {
                        onEditFileName(file.path, name);
                    }
                }
            }
        } else {
            if (file._isDirectory) {
                onConfirmAddFolder({
                    ...file,
                    name,
                })
            } else {
                onConfirmAddFile({
                    ...file,
                    name,
                });
            }
        }
    }, [
        getAllFiles,
        editing,
        file,
        onEditFileName,
        onConfirmAddFile,
        onConfirmAddFolder,
        onEditFolderName,
    ]);

    const handleChange = useCallback(() => {
        const name = nameRef.current?.textContent;
        if (!name) {
            return setShowError('文件名不能为空');
        }
        if (file.name === name) {
            return setShowError('');
        }
        const {
            newpath,
        } = getOldNewPath(file.path, name);
        const filenames = Object.keys(getAllFiles());
        for (let i = 0; i < filenames.length; i++) {
            if (newpath === filenames[i]) {
                return setShowError('文件名已存在');
            } else if (filenames[i].startsWith(newpath + '/')) {
                return setShowError('文件名已存在');
            }
        }
        setShowError('');
    }, [getAllFiles, file]);

    const handleKeyDown = useCallback((e: any) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            handleBlur();
        }
    }, [handleBlur]);

    useEffect(() => {
        if (!root && !file.name) {
            nameRef.current!.focus();
        }
    }, [file, root]);

    useEffect(() => {
        if (editing) {
            const dotIndex = file.name.indexOf('.');
            nameRef.current!.textContent = file.name;
            nameRef.current!.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            range.setStart(nameRef.current?.firstChild!, 0);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            range.setEnd(nameRef.current?.firstChild!, dotIndex > 0 ? dotIndex : file.name.length);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [editing, file]);

    useEffect(() => {
        const callback =  (e: any) => {
            setShowChild(false);
        }
        // 监听收起事件
        window.addEventListener('__COLLAPSE__FILE__', callback)
        return () => {
            window.removeEventListener('__COLLAPSE__FILE__', callback)
        };
    }, []);

    const keys = useMemo(() => {
        if (file._isFile) return [];
        const childs = file.children;
        const folders = Object.keys(childs).filter(key => !childs[key]._isFile).sort();
        const files = Object.keys(childs).filter(key => childs[key]._isFile).sort();
        return folders.concat(files);
    }, [file]);

    useEffect(() => {
        if (currentPath && currentPath.startsWith(file.path + '/')) {
            setShowChild(true);
        }
    }, [currentPath, file.path]);

    const handleFileAction = (action: string, path: string, isFile: boolean) => {
        switch (action) {
            case 'newFile':
                if (!isFile) {
                    setShowChild(true);
                    onAddFile(path + '/');
                }
                break;
            case 'newFolder':
                if (!isFile) {
                    setShowChild(true);
                    onAddFolder(path + '/');
                }
                break;
            case 'delete':
                isFile ? onDeleteFile(path) : onDeleteFolder(path);
                break;
            case 'editName':                                                                      
                setEditing(true)
                break;
            default:
                break;
        }
    };

    if (file._isFile) {
        let fileType;
        if (file.name && file.name.indexOf('.') !== -1) {
            fileType = `file_type_${file.name.split('.').slice(-1)}`;
        } else {
            fileType = 'default_file';
        }
        
        return (
             <div
                data-src={file.path}
                title={file.path}
                onClick={handleFileClick}
                key={file.path}
                data-is-file={file._isFile}
                onContextMenu={e => onContextMenu(e, handleFileAction)}
                className={`music-monaco-editor-list-file-item-row ${currentPath === file.path ? 'music-monaco-editor-list-file-item-row-focused' : ''}`}>
                <Icon
                    type={fileType}
                    style={{
                        marginLeft: '14px',
                        marginRight: '5px',
                    }} />
                {
                    (file.name && !editing) ? (
                        <>
                            <span style={{ flex: 1 }} className="music-monaco-editor-list-file-item-row-name">{file.name}</span>
                            {
                                (disableFileOps.rename || useFileMenu) ? null : <EditIcon
                                    onClick={(e:Event) => {
                                        e.stopPropagation();
                                        setEditing(true);
                                    }}
                                    className="music-monaco-editor-list-split-icon" />
                            }
                            {
                                (disableFileOps.delete || useFileMenu) ? null : (<DeleteIcon
                                    onClick={(e:Event) => {
                                        e.stopPropagation();
                                        onDeleteFile(file.path);
                                    }}
                                    className="music-monaco-editor-list-split-icon" />
                                )
                            }
                        </>
                    ) : (
                        <>
                            <div
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                }}
                                onInput={handleChange}
                                spellCheck={false}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                ref={nameRef}
                                className={`music-monaco-editor-list-file-item-new
                                ${showError ? 'music-monaco-editor-list-file-item-new-error' : ''}`}
                                contentEditable>
                            </div>
                        </>
                    )
                }
            </div> 
        )
    }
    return (
        <div className="music-monaco-editor-list-file-item"> 
            {
                file._isDirectory && (
                    <div
                        onClick={handleDirectoryClick}
                        className="music-monaco-editor-list-file-item-row"
                        title={file.path}
                        data-src={file.path}
                        data-is-file={file._isFile}
                        onContextMenu={e => onContextMenu(e, handleFileAction)}>
                        <Arrow collpase={!showChild} />
                        <Icon
                            style={{
                                marginRight: '5px',
                            }}
                            type={showChild ? 'default_folder_opened' : 'default_folder'} />
                            {(file.name && !editing) ? (
                                <>
                                    <span style={{ flex: 1 }} className="music-monaco-editor-list-file-item-row-name">{file.name}</span>
                                    {
                                        (disableFolderOps.rename || useFileMenu) ? null : (
                                            <EditIcon
                                                onClick={(e:Event) => {
                                                    e.stopPropagation();
                                                    setEditing(true);
                                                }}
                                                className="music-monaco-editor-list-split-icon" />
                                        )
                                    }
                                    {
                                        (disableFolderOps.delete || useFileMenu) ? null : (
                                            <DeleteIcon
                                                onClick={(e:Event) => {
                                                    e.stopPropagation();
                                                    onDeleteFolder(file.path);
                                                }}
                                                className="music-monaco-editor-list-split-icon" />
                                        )
                                    }
                                    {
                                        (disableFileOps.add || useFileMenu) ? null : (
                                            <AddFileIcon
                                                onClick={(e:Event) => {
                                                    e.stopPropagation();
                                                    setShowChild(true);
                                                    onAddFile(file.path + '/');
                                                }}
                                                className="music-monaco-editor-list-split-icon" />
                                        )
                                    }
                                    {
                                        (disableFolderOps.add || useFileMenu) ? null : (
                                            <AddFolderIcon
                                                onClick={(e:Event) => {
                                                    e.stopPropagation();
                                                    setShowChild(true);
                                                    onAddFolder(file.path + '/');
                                                }}
                                                className="music-monaco-editor-list-split-icon" />
                                        )
                                    }
                                </>
                                ) : (
                                <div
                                    onClick={(e: any) => {
                                        e.stopPropagation();
                                    }}
                                    onInput={handleChange}
                                    spellCheck={false}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleBlur}
                                    ref={nameRef}
                                    className={`music-monaco-editor-list-file-item-new
                                        ${showError ? 'music-monaco-editor-list-file-item-new-error' : ''}`}
                                    contentEditable />
                                )
                            }
                    </div>
                )
            }
            {
                (showChild || root) && (
                    <div style={{paddingLeft: file._isDirectory ? '7px' : '0'}}>
                        {
                            keys.map(item => (
                                <File
                                    getAllFiles={getAllFiles}
                                    disableFileOps={disableFileOps}
                                    disableFolderOps={disableFolderOps}
                                    onEditFileName={onEditFileName}
                                    onEditFolderName={onEditFolderName}
                                    onDeleteFile={onDeleteFile}
                                    onDeleteFolder={onDeleteFolder}
                                    onConfirmAddFile={onConfirmAddFile}
                                    onConfirmAddFolder={onConfirmAddFolder}
                                    onAddFile={onAddFile}
                                    onAddFolder={onAddFolder}
                                    currentPath={currentPath}
                                    root={false}
                                    file={file.children[item]}
                                    onPathChange={onPathChange}
                                    key={item}
                                    onContextMenu={onContextMenu}
                                    useFileMenu={useFileMenu}
                                    onClickItem={onClickItem}
                                />
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

export default File;