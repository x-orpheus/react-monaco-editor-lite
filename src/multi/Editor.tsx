import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import * as monacoType from 'monaco-editor';
import OpenedTab from '@components/openedtab';
import FileList from '@components/filelist';
import Modal from '@components/modal';
import Prettier from '@components/prettier';
import {
  worker,
  createOrUpdateModel,
  deleteModel,
  initFiles,
  getOldNewPath,
  filterNull,
} from '@utils';
import { THEMES } from '@utils/consts';
import { configTheme } from '@utils/initEditor';
import Setting from '@components/Setting';
import {
  useDragLine,
  usePrettier,
  useInit,
  useEditor,
  useVarRef,
} from './hook';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type FileChangeType =
  | 'addFile'
  | 'addFoler'
  | 'deleteFile'
  | 'deleteFolder'
  | 'renameFile'
  | 'renameFolder';
export interface filelist {
  [key: string]: string | null;
}
export interface MultiEditorIProps {
  ideConfig?: {
    disableFileOps?: {
      add?: boolean;
      rename?: boolean;
      delete?: boolean;
    };
    disableFolderOps?: {
      add?: boolean;
      rename?: boolean;
      delete?: boolean;
    };
    disableEslint?: boolean;
    disableSetting?: boolean;
    disablePrettier?: boolean;
    saveWhenBlur?: boolean;
  };
  defaultPath?: string;
  defaultTheme?: string;
  onPathChange?: (key: string) => void;
  onValueChange?: (v: string, path: string) => void;
  onRenameFile?: (oldpath: string, newpath: string) => void;
  onFileChange?: (
    type: FileChangeType,
    info?: {
      path?: string;
      value?: string;
      filename?: string;
      newpath?: string;
      newvalue?: string;
      newfilename?: string;
    }
  ) => void;
  onFileSave?: (key: string, value: string) => void;
  defaultFiles?: filelist;
  options: monacoType.editor.IStandaloneEditorConstructionOptions;
  title?: string;
}

export interface MultiRefType {
  getValue: (path: string) => string | null;
  getAllValue: () => filelist;
  getSupportThemes: () => Array<string>;
  setTheme: (name: string) => void;
  refresh: (files: filelist, path?: string) => void;
}

export const MultiEditorComp = React.forwardRef<
  MultiRefType,
  MultiEditorIProps
>(
  (
    {
      defaultPath,
      defaultTheme = 'OneDarkPro',
      onPathChange,
      onValueChange,
      onRenameFile,
      defaultFiles = {},
      onFileChange,
      onFileSave,
      ideConfig = {
        disableFileOps: {},
        disableFolderOps: {},
        disableEslint: false,
        disableSetting: false,
        disablePrettier: false,
        saveWhenBlur: false,
      },
      options,
      title,
    },
    ref
  ) => {
    const onPathChangeRef = useVarRef(onPathChange);
    const onValueChangeRef = useVarRef(onValueChange);
    const onFileChangeRef = useVarRef(onFileChange);
    const onFileSaveRef = useVarRef(onFileSave);
    const optionsRef = useVarRef(options);

    const rootRef = useRef(null);
    const filelistRef = useRef<any>(null);
    const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor>(null);
    const prePath = useRef<string | null>('');
    const filesRef = useRef({
      ...defaultFiles,
    });
    const valueLisenerRef = useRef<monacoType.IDisposable>();
    const editorStatesRef = useRef(new Map());

    const [openedFiles, setOpenedFiles] = useState<
      Array<{
        status?: string;
        path: string;
      }>
    >(
      defaultPath && filesRef.current[defaultPath]
        ? [
            {
              path: defaultPath,
            },
          ]
        : []
    );

    const [curPath, setCurPath] = useState(defaultPath || '');
    const curPathRef = useRef(defaultPath || '');
    const curValueRef = useRef('');

    const [autoPrettierRef, handleSetAutoPrettier, handleFromat] = usePrettier(
      editorRef as any
    );
    const [styles, handleMoveStart, handleMove, handleMoveEnd] =
      useDragLine(180);

    const disableEslintRef = useRef(ideConfig.disableEslint);
    disableEslintRef.current = ideConfig.disableEslint;

    const restoreModel = useCallback(
      (path: string) => {
        const editorStates = editorStatesRef.current;
        const model = window.monaco.editor
          .getModels()
          .find((model) => model.uri.path === path);
        if (path !== prePath.current && prePath.current) {
          editorStates.set(prePath.current, editorRef.current?.saveViewState());
        }
        if (model && editorRef.current) {
          editorRef.current.setModel(model);
          // 如果path改变，那么恢复上一次的状态
          if (path !== prePath.current) {
            // 取消上次的监听
            if (valueLisenerRef.current && valueLisenerRef.current.dispose) {
              valueLisenerRef.current.dispose();
            }
            const editorState = editorStates.get(path);
            if (editorState) {
              editorRef.current?.restoreViewState(editorState);
            }
            // 聚焦editor
            // editorRef.current?.focus();
            let timer: any = null;
            const v = model.getValue();
            curValueRef.current = v;
            valueLisenerRef.current = model.onDidChangeContent(() => {
              const v = model.getValue();
              setOpenedFiles((pre) =>
                pre.map((v) => {
                  if (v.path === path) {
                    v.status = 'editing';
                  }
                  return v;
                })
              );
              curValueRef.current = v;
              if (onValueChangeRef.current) {
                onValueChangeRef.current(v, path);
              }

              // eslint解析需要消抖，延迟500ms消抖即可
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => {
                timer = null;
                worker.then((res) => {
                  if (!disableEslintRef.current) {
                    res.postMessage({
                      code: model.getValue(),
                      version: model.getVersionId(),
                      path,
                    });
                  }
                });
              }, 500);
            });
          }
          worker.then((res) => {
            if (!disableEslintRef.current) {
              res.postMessage({
                code: model.getValue(),
                version: model.getVersionId(),
                path,
              });
            }
          });
          prePath.current = path;
          return model;
        } else {
          // 如果当前model不存在，那么取消监听
          if (valueLisenerRef.current && valueLisenerRef.current.dispose) {
            valueLisenerRef.current.dispose();
          }
        }
        return false;
      },
      [onValueChangeRef]
    );

    const seCurPathAndNotify = useCallback(
      (path: string, notify = true) => {
        if (path !== curPathRef.current) {
          curPathRef.current = path;
          if (onPathChangeRef.current && path && notify) {
            onPathChangeRef.current(path);
          }
          setCurPath(path);
        }
      },
      [onPathChangeRef]
    );

    const openOrFocusPath = useCallback(
      (path: string, notify = true) => {
        setOpenedFiles((pre) => {
          let exist = false;
          pre.forEach((v) => {
            if (v.path === path) {
              exist = true;
            }
          });
          if (exist) {
            return pre;
          } else {
            return [...pre, { path: path }];
          }
        });
        seCurPathAndNotify(path, notify);
      },
      [seCurPathAndNotify]
    );

    const handlePathChange = useCallback(
      (path: string, nofity = true) => {
        const model = restoreModel(path);
        if (model) {
          openOrFocusPath(path, nofity);
        }
      },
      [restoreModel, openOrFocusPath]
    );

    useInit(
      filesRef,
      editorRef,
      options,
      handlePathChange,
      defaultPath,
      ideConfig.disableEslint
    );

    useEffect(() => {
      setTimeout(() => {
        if (defaultPath) {
          handlePathChange(defaultPath);
        }
      });
    }, []);

    const saveFile = useCallback(
      (path?: string, model?: monacoType.editor.ITextModel) => {
        if (autoPrettierRef.current && !ideConfig.disablePrettier) {
          const realpath = path || curPathRef.current;
          handleFromat()?.then(() => {
            setOpenedFiles((pre) =>
              pre.map((v) => {
                if (v.path === realpath) {
                  v.status = 'saved';
                }
                return v;
              })
            );
            const val = model?.getValue() || curValueRef.current;
            filesRef.current[realpath] = val;
            if (onFileSaveRef.current) {
              onFileSaveRef.current(realpath, val);
            }
          });
        } else {
          setOpenedFiles((pre) =>
            pre.map((v) => {
              if (v.path === curPathRef.current) {
                v.status = 'saved';
              }
              return v;
            })
          );
          filesRef.current[curPathRef.current] = curValueRef.current;
          if (onFileSaveRef.current) {
            onFileSaveRef.current(curPathRef.current, curValueRef.current);
          }
        }
      },
      [handleFromat, autoPrettierRef, ideConfig.disablePrettier, onFileSaveRef]
    );

    const editorNodeRef = useEditor(
      editorRef,
      optionsRef,
      openOrFocusPath,
      ideConfig.saveWhenBlur ? saveFile : noop
    );

    const onCloseFile = useCallback(
      (path: string) => {
        let targetPath = '';
        if (openedFiles.length) {
          const res = openedFiles.filter((v, index) => {
            if (v.path === path) {
              if (index === 0) {
                if (openedFiles[index + 1]) {
                  targetPath = openedFiles[index + 1].path;
                }
              } else {
                targetPath = openedFiles[index - 1].path;
              }
            }
            return v.path !== path;
          });
          // 目标文件是当前文件，且存在下一激活文件时，执行model及path切换的逻辑
          if (targetPath && curPathRef.current === path) {
            restoreModel(targetPath);
            seCurPathAndNotify(targetPath);
          }
          if (res.length === 0) {
            restoreModel('');
            seCurPathAndNotify('');
            prePath.current = '';
          }
          setOpenedFiles(res);
        }
      },
      [restoreModel, openedFiles, seCurPathAndNotify]
    );

    const closeOtherFiles = useCallback(
      (path: string) => {
        const unSavedFiles = openedFiles.filter((v) => v.status === 'editing');
        if (unSavedFiles.length) {
          Modal.confirm({
            title: '是否要保留未保存文件的修改',
            target: rootRef.current,
            okText: '保存',
            cancelText: '不保存',
            onCancel: (close: () => void) => {
              close();
              setOpenedFiles((pre) => pre.filter((p) => p.path === path));
              restoreModel(path);
              seCurPathAndNotify(path);
              // 恢复文件的数值修改
              unSavedFiles.forEach((v) => {
                const value = filesRef.current[v.path] || '';
                createOrUpdateModel(v.path, value);
              });
              prePath.current = path;
            },
            onOk: (close: () => void) => {
              close();
              unSavedFiles.forEach((v) => {
                const model = window.monaco.editor
                  .getModels()
                  .find((model) => model.uri.path === v.path);
                if (autoPrettierRef.current) {
                  const p = window.require('prettier');
                  if (!p.prettier) return;
                  const text = p.prettier.format(model?.getValue(), {
                    filepath: model?.uri.path,
                    plugins: p.prettierPlugins,
                    singleQuote: true,
                    tabWidth: 4,
                  });
                  filesRef.current[v.path] = text;
                  createOrUpdateModel(v.path, text);
                } else {
                  filesRef.current[v.path] = model?.getValue() || '';
                }
              });
              setOpenedFiles((pre) => pre.filter((p) => p.path === path));
              restoreModel(path);
              seCurPathAndNotify(path);
              prePath.current = path;
            },
            content: () => (
              <div>
                <div>如果不保存，你的更改将丢失</div>
                <div>未保存的文件路径:</div>
                {unSavedFiles.map((v) => (
                  <div key={v.path}>{v.path}</div>
                ))}
              </div>
            ),
          });
        } else {
          setOpenedFiles((pre) => pre.filter((p) => p.path === path));
          restoreModel(path);
          seCurPathAndNotify(path);
          prePath.current = path;
        }
      },
      [restoreModel, openedFiles, autoPrettierRef, seCurPathAndNotify]
    );

    const abortFileChange = useCallback(
      (path: string) => {
        const value = filesRef.current[path] || '';
        createOrUpdateModel(path, value);
        onCloseFile(path);
      },
      [onCloseFile]
    );

    const dealKey = useCallback(
      (e: React.KeyboardEvent<HTMLElement>) => {
        const ctrlKey = e.ctrlKey || e.metaKey;
        const keyCode = e.keyCode;

        if (ctrlKey && keyCode === 83) {
          e.preventDefault();
          saveFile();
        }
      },
      [saveFile]
    );

    // useEffect(() => {
    //     if (onPathChangeRef.current && curPath) {
    //         onPathChangeRef.current(curPath);
    //     }
    //     curPathRef.current = curPath;
    // }, [curPath, onPathChangeRef]);

    const addFile = useCallback(
      (path: string, value?: string, notify = true) => {
        createOrUpdateModel(path, value || '');
        filesRef.current[path] = value || '';
        handlePathChange(path);
        if (notify && onFileChangeRef.current) {
          onFileChangeRef.current('addFile', {
            path,
            value: '',
          });
        }
      },
      [handlePathChange, onFileChangeRef]
    );

    const deleteFile = useCallback(
      (path: string, notify = true) => {
        onCloseFile(path);
        setTimeout(() => {
          deleteModel(path);
        }, 50);
        delete filesRef.current[path];
        if (onFileChangeRef.current && notify) {
          onFileChangeRef.current('deleteFile', {
            path,
          });
        }
      },
      [onCloseFile, onFileChangeRef]
    );

    const editFileName = useCallback(
      (path: string, name: string) => {
        const value = filesRef.current[path] || '';
        deleteFile(path, false);
        const { oldpath, newpath } = getOldNewPath(path, name);
        addFile(newpath, value, false);
        if (onFileChangeRef.current) {
          onFileChangeRef.current('renameFile', {
            path: oldpath,
            newpath: newpath,
          });
        }
        if (onRenameFile) {
          onRenameFile(oldpath, newpath);
        }
      },
      [deleteFile, addFile, onFileChangeRef, onRenameFile]
    );

    const addFolder = useCallback(
      (path: string, notify = true) => {
        let hasChild = false;
        Object.keys(filesRef.current).forEach((p) => {
          if (p.startsWith(path + '/')) {
            hasChild = true;
          }
        });
        if (!hasChild) {
          filesRef.current[path] = null;
        }
        if (onFileChangeRef.current && notify) {
          onFileChangeRef.current('addFolder', {
            path,
          });
        }
      },
      [onFileChangeRef]
    );

    const deleteFolder = useCallback(
      (path: string) => {
        // 删除目录引用
        delete filesRef.current[path];
        // 删除子路径下的子文件和文件夹
        Object.keys(filesRef.current).forEach((p) => {
          if (p.startsWith(path + '/')) {
            const value = filesRef.current[p];
            if (typeof value === 'string') {
              deleteFile(p, false);
            }
          }
        });
        if (onFileChangeRef.current) {
          onFileChangeRef.current('deleteFolder', {
            path,
          });
        }
      },
      [deleteFile, onFileChangeRef]
    );

    const editFolderName = useCallback(
      (path: string, name: string) => {
        const paths = (path || '/').slice(1).split('/');
        const newPath = '/' + paths.slice(0, -1).concat(name).join('/');
        // 删除文件夹引用
        delete filesRef.current[path];
        // 新建文件夹引用
        addFolder(newPath, false);
        // 删除子路径下的子文件和文件夹
        Object.keys(filesRef.current).forEach((p) => {
          if (p.startsWith(path + '/')) {
            const value = filesRef.current[p];
            if (typeof value === 'string') {
              setTimeout(() => {
                // 子文件需要删除原model
                deleteModel(p);
                // 重新创建新model
                const finalPath = p.replace(path + '/', newPath + '/');
                createOrUpdateModel(finalPath, value || '');
                filesRef.current[finalPath] = value || '';
              }, 50);
            }
            delete filesRef.current[p];
          }
        });
        // 对已打开的涉事文件进行路径替换处理
        setOpenedFiles((pre) =>
          pre.map((v) => {
            if (v.path.startsWith(path + '/')) {
              v.path = v.path.replace(path + '/', newPath + '/');
            }
            return v;
          })
        );
        // 如果涉及当前激活的model，则需要重新打开
        if (curPathRef.current.startsWith(path + '/')) {
          setTimeout(() => {
            handlePathChange(
              curPathRef.current.replace(path + '/', newPath + '/')
            );
          }, 50);
        }
        if (onFileChangeRef.current) {
          onFileChangeRef.current('renameFolder', {
            path,
            newpath: newPath,
          });
        }
      },
      [handlePathChange, addFolder, onFileChangeRef]
    );

    const decorcations = useRef<any>(null);

    const locModel = useCallback((loc: any) => {
      const { start, end } = loc;
      decorcations.current = editorRef.current?.deltaDecorations(
        decorcations.current || [],
        [
          {
            range: new window.monaco.Range(
              start.line,
              start.column,
              end.line,
              end.column
            ),
            options: {
              className: 'music-monaco-editor-highlight',
              isWholeLine: true,
            },
          },
        ]
      );
      editorRef.current?.revealLineInCenter(start.line);
    }, []);

    const refreshFiles = useCallback(
      (
        files: filelist,
        path?: string,
        loc?: {
          start: {
            line: number;
            column: number;
          };
          end: {
            line: number;
            column: number;
          };
        }
      ) => {
        // 初始化文件列表
        initFiles(files);
        // 删除多余文件
        Object.keys(filesRef.current).forEach((file) => {
          if (files[file]) {
            filesRef.current[file] = files[file];
          } else {
            // deleteFile(file); // FIXME: 为什么这么写
            delete filesRef.current[file];
          }
        });
        // 保存新的打开文件列表
        filesRef.current = {
          ...files,
        };
        // 重置openedTab
        setOpenedFiles((pre) =>
          pre
            .filter((v) => files[v.path])
            .map((v) => ({
              ...v,
              status: 'saved',
            }))
        );
        if (path !== curPathRef.current) {
          // 重置当前tab
          let res = files[curPathRef.current] ? curPathRef.current : '';
          if (path && files[path]) {
            res = path;
          }
          handlePathChange(res);
        }
        loc && locModel(loc);
        // 更新文件列表
        filelistRef.current.refresh(files);
      },
      [deleteFile, handlePathChange, locModel]
    );

    const getAllFiles = useCallback(() => filterNull(filesRef.current), []);

    useImperativeHandle(ref, () => ({
      getValue: (path: string) => filesRef.current[path],
      getAllValue: getAllFiles,
      getSupportThemes: () => THEMES,
      setTheme: (name) => configTheme(name),
      refresh: refreshFiles,
    }));

    return (
      <div
        ref={rootRef}
        id="music-monaco-editor-root"
        tabIndex={0}
        onKeyDown={dealKey}
        onMouseMove={handleMove}
        onMouseUp={handleMoveEnd}
        className="music-monaco-editor">
        <FileList
          getAllFiles={getAllFiles}
          title={title}
          disableFileOps={ideConfig.disableFileOps}
          disableFolderOps={ideConfig.disableFolderOps}
          ref={filelistRef}
          rootEl={rootRef}
          onEditFileName={editFileName}
          onDeleteFile={deleteFile}
          onAddFile={addFile}
          onAddFolder={addFolder}
          onDeleteFolder={deleteFolder}
          onEditFolderName={editFolderName}
          style={styles}
          currentPath={curPath}
          defaultFiles={defaultFiles}
          onPathChange={handlePathChange}
        />
        <div
          onMouseDown={handleMoveStart}
          className="music-monaco-editor-drag"
        />
        <div className="music-monaco-editor-area">
          <OpenedTab
            onCloseOtherFiles={closeOtherFiles}
            onSaveFile={saveFile}
            onAbortSave={abortFileChange}
            rootEl={rootRef}
            currentPath={curPath}
            openedFiles={openedFiles}
            onCloseFile={onCloseFile}
            onPathChange={handlePathChange}
          />
          <div ref={editorNodeRef} style={{ flex: 1, width: '100%' }} />
          {openedFiles.length === 0 && (
            <div className="music-monaco-editor-area-empty">
              <img
                src="//p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/5759801316/fb85/e193/a256/03a81ea60cf94212bbc814f2c82b6940.png"
                className="music-monaco-editor-area-empty-icon"
              />
              <div>{title}</div>
            </div>
          )}
        </div>
        {ideConfig.disablePrettier ? null : (
          <Prettier
            onClick={handleFromat}
            className="music-monaco-editor-prettier"
          />
        )}
        {ideConfig.disableSetting ? null : (
          <Setting
            disablePrettier={ideConfig.disablePrettier}
            defaultTheme={defaultTheme}
            getTarget={() => rootRef.current}
            autoPrettier={autoPrettierRef.current}
            onAutoPrettierChange={handleSetAutoPrettier}
          />
        )}
      </div>
    );
  }
);

export default MultiEditorComp;

MultiEditorComp.displayName = 'MultiEditorComp';
