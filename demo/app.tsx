import ReactDOM, { unstable_batchedUpdates } from 'react-dom';
import { useCallback, useState, useEffect, useRef } from 'react';
import Editor from '../src/multi';
import { themes } from '@utils/initEditor';
import { THEMES, ASSETSPATH } from '@utils/consts';
import { copyDataToClipBoard } from '@utils';
interface filelist {
    [key: string]: string,
}

declare global {
    interface Window {
        eslint: any,
        linter: any,
    }
}

const filesName = [
    '/index.html',
    '/app/index.jsx',
    '/app/index.css',
    '/app/button.jsx',
    '/src/index.jsx',
    '/src/components/index.jsx',
    // '/app.js',
    // '/cc.js',
    '/app.ts',
    '/cc.ts',
    // '/test.css',
    // '/src/index.jsx',
    '/style.md',
    // '/styles/index.less',
    // '/src/components/title/index.js',
    // '/src/components/title/index.less',
];

const App = () => {
    const [files, setFiles] = useState<filelist>({});
    const editorRef = useRef<any>(null);
    const [colors, setColors] = useState<{
        [key: string]: string,
    }>({});

    useEffect(() => {
        // 获取多文件
        const promises = filesName.map(async v => await (await (fetch(`${ASSETSPATH}editorfiles${v}`))).text());
        Promise.all(promises).then(filesContent => {
            const res:filelist = {};
            filesContent.forEach((content, index) => {
                res[filesName[index]] = content;
            });
            unstable_batchedUpdates(() => {
                setFiles(res);
                // setPath(filesName[0]);
                // setValue(filesContent[0]);
            });
        });
        setTimeout(() => {
            console.log(themes);
            setColors(themes['GithubLightDefault'].colors);
        }, 5000);
    }, []);

    // 设置当前文件路径和value
    const handlePathChange = useCallback((key: string) => {
        console.log(key);
    }, []);

    // // 同步ide内容修改
    // const handleChange = useCallback((v: string) => {
    //     console.log(v);
    // }, []);

    // const handleFileChange = (key: string, value: string) => {
    //     console.log(key, value);
    // }

    const handleThemeChange = (e: any) => {
        editorRef.current.setTheme(e.target.value);
    };

    // const sandboxRef = useRef(null);

    // const sendMessage = () => {
    //     // @ts-ignore
    //     sandboxRef.current.contentWindow.postMessage({
    //         type: 'SAVE_FILES',
    //         files,
    //     }, 'http://localhost:8081');
    // };

    // useEffect(() => {
    //     window.addEventListener('message', res => console.log(res));
    // }, []);
    const [activePath, setActivePath] = useState('/style.md');

    useEffect(() => {
        console.log(files);
        if (editorRef.current) {
            editorRef.current.refresh(files, activePath, {
                start: {
                    line: 1,
                    column: 1,
                },
                end: {
                    line: 5,
                    column: 1,
                }
            });
        }
    });

    const addFile = useCallback(() => {
        setActivePath('/src/pages/new-page1.js');
        setFiles(pre => ({
            ...pre,
            '/src/pages/new-page1.js': 'import React from "react"',
        }));
    }, []);

    return (
        <div>
            <div onClick={addFile}>addFile</div>
            <div onClick={() => console.log(editorRef.current) }>ref api</div>
            <div onClick={() => console.log(editorRef.current.refresh(files, '/style.md', {
                start: {
                    line: 29,
                    column: 1,
                },
                end: {
                    line: 40,
                    column: 1,
                }
            })) }>getAllValue</div>
            {/* <div onClick={sendMessage}>send postmessage</div> */}
            <div onClick={() => setColors(themes['OneDarkPro'].colors)}>refresh theme color</div>
            <select
                name="theme"
                onChange={handleThemeChange}
                defaultValue="OneDarkPro" >
                {
                    THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)
                }
            </select>
            {
                Object.keys(files).length > 0 && (
                    <div style={{ width: '800px', height: '600px' }}>
                        <Editor
                            title="tango project"
                            defaultTheme='GithubLightDefault'
                            ideConfig={{
                                // disableFileOps: true,
                                // disablePrettier: true,
                                // disableEslint: true,
                                saveWhenBlur: true,
                                disableFileOps: {
                                    add: true,
                                    delete: true,
                                    rename: false,
                                },
                                disableFolderOps: {
                                    add: false,
                                    delete: false,
                                    rename: false,
                                }
                            }}
                            onPathChange={(path) => { console.log(path); setActivePath(path); }}
                            onFileSave={(key: string, value: string) => console.log(key, value)}
                            onRenameFile={(...args) => {
                                setFiles((pre) => {
                                    const res = {...pre};
                                    res[args[1]] = res[args[0]];
                                    delete res[args[0]];
                                    return res;
                                });
                                setActivePath(args[1]);
                            }}
                            ref={editorRef}
                            defaultPath="/app/index.jsx"
                            defaultFiles={files}
                            options={{
                                fontSize: 14,
                                automaticLayout: true,
                            }} />
                    </div>
                )
            }
            {/* <iframe src="http://localhost:8081/index.html" ref={sandboxRef} /> */}
            <div style={{
                position: 'absolute',
                right: '0',
                top: '0',
                bottom: '0',
                width: '400px',
                overflow: 'scroll',
            }}>
                {
                    Object.keys(colors).map(v => (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                            onClick={() => {
                                copyDataToClipBoard(`var(--monaco-${v.replace('.', '-')})`)
                            }}
                            key={v}>
                            <div style={{
                                marginRight: '5px',
                            }}>{v}</div>
                            <div style={{
                                width: '100px',
                                height: '14px',
                                background: colors[v],
                            }} />
                        </div>)
                    )
                }
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));