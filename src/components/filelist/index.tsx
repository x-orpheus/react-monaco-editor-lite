import React, {
  useCallback,
  useState,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import AddFileIcon from "@components/icons/addfile";
import AddFolderIcon from "@components/icons/addfolder";
import Modal from "@components/modal";
import {
  generateFileTree,
  addSourceFile,
  deleteSourceFile,
  editSourceFileName,
  addSourceFolder,
  deleteSourceFolder,
  editSourceFolderName,
  getOldNewPath,
} from "@utils/index";
import File from "./file";
import "./index.less";
import OpenFilePanel from "./open-file-panel";
import SearchIcon from "@components/icons/search";
import Collapse from "@components/icons/collapse";
import Dropdown from "rc-dropdown";
import "rc-dropdown/assets/index.css";
import FileMenu from "../menu";

export interface FileTreeIProps {
  defaultFiles: any;
  openedFiles: any;
  getAllFiles: () => any;
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
  onCloseFile: (path: string) => void;
  rootEl: React.MutableRefObject<null>;
  setSearchTextVisible: (visible: boolean) => void;
  disableFileOps?: {
    add?: boolean;
    delete?: boolean;
    rename?: boolean;
  };
  disableFolderOps?: {
    add?: boolean;
    delete?: boolean;
    rename?: boolean;
  };
  useFileMenu: boolean;
}

export interface FileTreeRefType {
  refresh: (defaultFiles: any) => void;
}

const FileTree = React.forwardRef<FileTreeRefType, FileTreeIProps>(
  (
    {
      defaultFiles,
      getAllFiles,
      onPathChange,
      title,
      currentPath = "",
      style,
      onAddFile,
      onDeleteFile,
      onEditFileName,
      onAddFolder,
      onDeleteFolder,
      onEditFolderName,
      onCloseFile,
      setSearchTextVisible,
      rootEl,
      disableFileOps = {},
      disableFolderOps = {},
      openedFiles,
      useFileMenu = true,
    },
    ref
  ) => {
    const [filetree, setFiletree] = useState(() =>
      generateFileTree(defaultFiles)
    );
    const [menuVisible, setMenuVisible] = useState(false);
    const [isMenuFile, setIsMenuFile] = useState(false);
    const [menuPath, setMenuPath] = useState("");
    const menuAction =
      useRef<(action: string, path: string, isFile: boolean) => void | null>();
    const isFirstRun = useRef(true);
    const activeDirectory = useRef("/");

    useImperativeHandle(ref, () => ({
      refresh: (files) => setFiletree(generateFileTree(files)),
    }));

    const addFile = useCallback(
      (path: string) => {
        setFiletree(addSourceFile(filetree, path));
      },
      [filetree]
    );

    const handleContextMenu = useCallback(
      (
        event: any,
        fileAction: (action: string, path: string, isFile: boolean) => void
      ) => {
        event.preventDefault();
        if (menuVisible) {
          setMenuPath(event.currentTarget.dataset.src);
          setIsMenuFile(event.currentTarget.dataset.isFile);
        }

        if (!menuVisible && isFirstRun.current) {
          const action = fileAction;
          menuAction.current = action;
          isFirstRun.current = false;
          setMenuPath(event.currentTarget.dataset.src);
          setIsMenuFile(event.currentTarget.dataset.isFile);
          setMenuVisible(true);
        }
      },
      [menuVisible, menuAction, setMenuVisible, isFirstRun]
    );

    const handleMenuClick = useCallback(
      (info: any, path: string, isFile: boolean) => {
        const action = menuAction.current;
        if (action) {
          action(info.key, path, isFile);
        }

        setMenuVisible(false);
        isFirstRun.current = true;
      },
      [menuAction, setMenuVisible]
    );

    const deleteFile = useCallback(
      (path: string) => {
        Modal.confirm({
          target: rootEl.current,
          okText: "删除",
          onOk: (close: () => void) => {
            setFiletree(deleteSourceFile(filetree, path));
            onDeleteFile(path);
            close();
          },
          title: "是否确实要删除本文件",
          content: () => (
            <div>
              <div>删除后不可恢复</div>
              <div>当前文件路径: {path}</div>
            </div>
          ),
        });
      },
      [filetree, onDeleteFile, rootEl]
    );

    const editFileName = useCallback(
      (path: string, name: string) => {
        setFiletree(editSourceFileName(filetree, path, name));
        onEditFileName(path, name);
      },
      [filetree, onEditFileName]
    );

    const handleConfirmAddFile = useCallback(
      (file: any) => {
        let tree: any = {};
        if (file.name) {
          const { newpath } = getOldNewPath(file.path, file.name);
          const files = getAllFiles();
          if (files[newpath] || files[newpath] === "") {
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
      },
      [filetree, onAddFile, getAllFiles]
    );

    const addFolder = useCallback(
      (path: string) => {
        setFiletree(addSourceFolder(filetree, path));
      },
      [filetree]
    );

    const deleteFolder = useCallback(
      (path: string) => {
        Modal.confirm({
          target: rootEl.current,
          okText: "删除",
          onOk: (close: () => void) => {
            setFiletree(deleteSourceFolder(filetree, path));
            onDeleteFolder(path);
            close();
          },
          title: "是否确实要删除此文件夹",
          content: () => (
            <div>
              <div>文件夹删除后不可恢复，同时会删除子文件夹</div>
              <div>当前文件路径: {path}</div>
            </div>
          ),
        });
      },
      [filetree, onDeleteFolder, rootEl]
    );

    const editFolderName = useCallback(
      (path: string, name: string) => {
        setFiletree(editSourceFolderName(filetree, path, name));
        onEditFolderName(path, name);
      },
      [filetree, onEditFolderName]
    );

    const handleConfirmAddFolder = useCallback(
      (file: any) => {
        let tree: any = {};
        if (file.name) {
          const { newpath } = getOldNewPath(file.path, file.name);
          const filenames = Object.keys(getAllFiles());
          let exist = false;
          for (let i = 0; i < filenames.length; i++) {
            if (newpath === filenames[i]) {
              exist = true;
              break;
            } else if (filenames[i].startsWith(newpath + "/")) {
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
      },
      [filetree, onAddFolder]
    );

    const getParentPath = useCallback((path: string) => {
      return path.replace(/\/[^\/]*$/, "/");
    }, []);

    const updateActiveDirectory = useCallback((path: string) => {
      const files = getAllFiles();
      const fileNames = Object.keys(files);
      // ignore the directory not in given file list
      if (fileNames.every(fileName => !fileName.startsWith(path))) {
        return;
      }
      activeDirectory.current = path;
    }, [getAllFiles]);

    const handleClickItem = useCallback((item: { path: string, isFile: boolean }) => {
      const { path, isFile } = item;
      updateActiveDirectory(isFile ? getParentPath(path) : `${path.replace(/\/$/, "")}/`);
    }, [getParentPath, updateActiveDirectory]);

    useEffect(() => {
      // update directory in case the current file is changed inside the editor
      // currentPath can only be file path
      updateActiveDirectory(getParentPath(currentPath));
    }, [currentPath, getParentPath, updateActiveDirectory]);

    return (
      <div className="music-monaco-editor-list-wrapper" style={style}>
        <OpenFilePanel
          filetree={filetree}
          openedFiles={openedFiles}
          onPathChange={onPathChange}
          onCloseFile={onCloseFile}
          currentPath={currentPath}
        ></OpenFilePanel>
        <div className="music-monaco-editor-list-title">
          <span
            style={{ flex: 1 }}
            className="music-monaco-editor-list-title-name"
          >
            {title || "CORE"}
          </span>
          <span title="文件搜索 CMD+SHIFT+F">
            <SearchIcon
              onClick={() => {
                setSearchTextVisible(true);
              }}
              className="music-monaco-editor-list-title-icon"
            />
          </span>
          {disableFileOps.add ? null : (
            <span title="新建文件">
              <AddFileIcon
                onClick={(e: Event) => {
                  e.stopPropagation();
                  addFile(activeDirectory.current);
                }}
                className="music-monaco-editor-list-title-icon"
              />
            </span>
          )}
          {disableFolderOps.add ? null : (
            <span title="新建文件夹">
              <AddFolderIcon
                onClick={(e: Event) => {
                  e.stopPropagation();
                  addFolder(activeDirectory.current);
                }}
                className="music-monaco-editor-list-title-icon"
              />
            </span>
          )}
          <span title="收起">
            <Collapse
              onClick={() => {
                // 创建一个自定义事件
                const customEvent = new CustomEvent("__COLLAPSE__FILE__", {});
                // 发送自定义事件
                window.dispatchEvent(customEvent);
              }}
              className="music-monaco-editor-list-title-icon"
            />
          </span>
        </div>

        {useFileMenu ? (
          <Dropdown
            visible={menuVisible}
            trigger={["contextMenu"]}
            overlay={
              <FileMenu
                disableFileOps={disableFileOps}
                disableFolderOps={disableFolderOps}
                isFile={isMenuFile}
                path={menuPath}
                handleMenuClick={handleMenuClick}
              />
            }
            onVisibleChange={(visible) => setMenuVisible(visible)}
            alignPoint={true}
          >
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
                onPathChange={onPathChange}
                onContextMenu={handleContextMenu}
                onClickItem={handleClickItem}
                useFileMenu={useFileMenu}
              />
            </div>
          </Dropdown>
        ) : (
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
              onPathChange={onPathChange}
              onContextMenu={handleContextMenu}
              onClickItem={handleClickItem}
              useFileMenu={useFileMenu}
            />
          </div>
        )}
      </div>
    );
  }
);

FileTree.displayName = "filetree";

export default React.memo(FileTree);
