import { loadWASM } from 'onigasm';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
declare type monacoType = typeof import("monaco-editor");
import tango from '@music/tango-boot';
import * as t from '@music/tango-cms';
import { setupTypeAcquisition } from './newata';
import { ASSETSPATH } from './consts';
declare global {
    interface Window {
        monaco: monacoType;
        define: any;
        prettier: any;
        prettierPlugins: any;
        require: any,
        ts: any,
    }
}

function loadScript(url: string, cb: () => void) {
    const script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('body')[0].appendChild(script);
    script.onload = cb;
}

// function loadCode(code: string) {
//     const script = document.createElement('script');
//     script.type = ' text/javascript';
//     script.appendChild(document.createTextNode(code));
//     document.getElementsByTagName('body')[0].appendChild(script);
// }

let execed = false;

const grammerMap: {
    [key: string]: string,
} = {
    'source.ts': 'Typescript.tmLanguage.json',
    'source.js': 'Javascript.tmLanguage.json',
    'source.js.jsx': 'JavaScriptReact.tmLanguage.json',
    'source.ts.tsx': 'TypesSriptReact.tmLanguage.json',
    'source.css': 'css.tmLanguage.json',
    'source.less': 'less.tmLanguage.json',
    'text.html.basic': 'html.tmLanguage.json',
}

export const themes: {
    [key: string]: any,
} = {};

export async function configTheme(name: string) {
    let theme = themes[name];
    if (!theme) {
        theme = JSON.parse(await (await fetch(`${ASSETSPATH}themes/${name}.json?v=0`)).text());
        themes[name] = theme;
        // 定义主题
        window.monaco.editor.defineTheme(name, theme);
    }

    const prefix = '--monaco-';

    let style = document.getElementById('monaco-editor-theme-style');

    if (!style) {
        style = document.createElement('style');
        style.id = 'monaco-editor-theme-style';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    let res = '#music-monaco-editor-root {';

    Object.keys(theme.colors).forEach(v => {
        res += `${prefix}${v.replace('.', '-')}: ${theme.colors[v] || 'rgba(0, 0, 0, 0)'};`;
    });

    res += '}';

    style.innerHTML = res;
    
    // 设置主题
    window.monaco.editor.setTheme(name);
}

async function addExtraLib() {
    window.monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        allowJs: true,
        allowNonTsExtensions: true,
        allowSyntheticDefaultImports: true, // for use of import React from 'react' ranther than import * as React from 'react'
    })
}

export function addGlobalExtraLib(code: string, _path: string) {
    const path = "file://" + _path;
    window.monaco.languages.typescript.javascriptDefaults.addExtraLib(code, path);
    window.monaco.languages.typescript.typescriptDefaults.addExtraLib(code, path);
    const uri = window.monaco.Uri.file(_path)
    if (window.monaco.editor.getModel(uri) === null) {
        window.monaco.editor.createModel(code, "javascript", uri)
    }
}

function configMonaco() {
    const init = async () => {
        window.monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        window.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });
        // 加载textmate语义解析webassembly文件
        await loadWASM(`${ASSETSPATH}onigasm.wasm`);

        addExtraLib();
    };
    init();

    window.monaco.languages.register({ id: 'JavascriptReact' });
    window.monaco.languages.register({ id: 'TypescriptReact' });
    
    // 创建语法映射
    const grammars = new Map();
    
    grammars.set('typescript', 'source.ts');
    grammars.set('javascript', 'source.js');
    grammars.set('JavascriptReact', 'source.js.jsx');
    grammars.set('TypescriptReact', 'source.ts.tsx');
    grammars.set('less', 'source.less');
    grammars.set('css', 'source.css');
    grammars.set('html', 'text.html.basic');
    
    // 创建一个注册表，可以从作用域名称来加载对应的语法文件
    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            const res = await (await fetch(`${ASSETSPATH}Grammars/${grammerMap[scopeName]}`)).text();
            return {
                format: 'json', // 语法文件格式，有json、plist
                content: res,
            };
        },
    });
    
    // 将语法映射揉进monaco
    function wireMonacoGrammars() {
        wireTmGrammars(window.monaco, registry, grammars);
    }

    // 延迟语法解析的修改，防止monaco在加载后覆盖次语法映射
    setTimeout(() => {
        wireMonacoGrammars();
    }, 3000);
}

export const startUp = () => {
    if (execed) return;
    execed = true;
    loadScript('https://g.alicdn.com/code/lib/monaco-editor/0.33.0/min/vs/loader.min.js', () => {
        window.require.config({ paths: { vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.33.0/min/vs' } });

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        window.require(['vs/editor/editor.main'], () => {});
        window.define('tsworker', ['vs/language/typescript/tsWorker'], (tsworker: any) => {
            const ata = setupTypeAcquisition({
                projectName: "My ATA Project",
                typescript: window.ts,
                // logger: console,
                delegate: {
                  receivedFile: (code: string, path: string) => {
                    // console.log(path);
                    addGlobalExtraLib(code, path);
                    // Add code to your runtime at the path...
                  },
                  started: () => {
                    // console.log("ATA start")
                  },
                  progress: (downloaded: number, total: number) => {
                    console.log(`Got ${downloaded} out of ${total}`)
                  },
                  finished: (vfs: any) => {
                    // console.log("ATA done", vfs)
                  },
                },
            });
            ata(`import danger from "@music/tango-boot";`);
            return tsworker;
        })
        window.define('prettier', [
                'https://unpkg.com/prettier@2.5.1/standalone.js',
                'https://unpkg.com/prettier@2.5.1/parser-babel.js',
                'https://unpkg.com/prettier@2.5.1/parser-html.js',
                'https://unpkg.com/prettier@2.5.1/parser-postcss.js',
                'https://unpkg.com/prettier@2.5.1/parser-typescript.js'
            ], (prettier: any, ...args: any[]) => {
            const prettierPlugins = {
                babel: args[0],
                html: args[1],
                postcss: args[2],
                typescript: args[3],
            }
            return {
                prettier,
                prettierPlugins,
            }
        });
    });
    const interval = setInterval(() => {
        if(window.monaco) {
            configMonaco();
            clearInterval(interval);
        }
    }, 100);
}
