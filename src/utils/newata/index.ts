import path from "path-browserify";
import { mapModuleNameToModule } from "./edgeCases"
import { getDTSFileForModuleWithVersion } from './apis';

interface Logger {
    log: (...args: any[]) => void
    error: (...args: any[]) => void
    groupCollapsed: (...args: any[]) => void
    groupEnd: (...args: any[]) => void
}

type ModuleMeta = { state: 'loading', version: string }

type FileMeta = { state: 'loading' };

export interface ATABootstrapConfig {
    /** A object you pass in to get callbacks */
    delegate: {
        /** The callback which gets called when ATA decides a file needs to be written to your VFS  */
        receivedFile?: (code: string, path: string) => void
        /** A way to display progress */
        progress?: (downloaded: number, estimatedTotal: number) => void
        /** Note: An error message does not mean ATA has stopped! */
        errorMessage?: (userFacingMessage: string, error: Error) => void
        /** A callback indicating that ATA actually has work to do */
        started?: () => void
        /** The callback when all ATA has finished */
        finished?: (files: Map<string, string>) => void
    }
    /** Passed to fetch as the user-agent */
    projectName: string
    /** Your local copy of typescript */
    typescript: typeof import("typescript")
    /** If you need a custom version of fetch */
    fetcher?: typeof fetch
    /** If you need a custom logger instead of the console global */
    logger?: Logger
}

export const setupTypeAcquisition = (config: ATABootstrapConfig) => {
    const moduleMap = new Map<string, ModuleMeta>()
    const FileMap = new Map<string, FileMeta>()
    const fsMap = new Map<string, string>()
    const modulesToDownload: any[] = [];
    let curModule: {
        name: string,
        fspath: string,
        path: string,
        version: string,
    };

    let estimatedToDownload = 0
    let estimatedDownloaded = 0

    return async (initialSourceFile: string) => {
        estimatedToDownload = 0
        estimatedDownloaded = 0

        for (let i = -1; i < modulesToDownload.length; i++) {
            if (i < 0) {
                // 初次使用输入文件作为依赖搜集的开始
                await resolveDeps(initialSourceFile, 0, '');
            } else {
                // 获取模块的package.json文件
                const res = await dealNodeModules(modulesToDownload[i].module, config);
                if (res) {
                    curModule = res;
                    // console.log(curModule);
                    try {
                        // 读取 types 入口文件
                        const dtsCode = await getDTSFileForModuleWithVersion(config, curModule.name, curModule.version, curModule.path);
                        config.delegate.receivedFile?.(dtsCode, path.join('/node_modules', curModule.name, curModule.path));
                        // 递归，从入口文件开始分析
                        await resolveDeps(dtsCode, 0, path.join(curModule.path, '../'));
                    } catch (e) {
                        // 如果有误，则情况是： path/path2.d.ts文件不存在，应该查找的为  path/path2/index.d.ts，如果还是不存在，则不处理
                        try {
                            const dtsCode = await getDTSFileForModuleWithVersion(config, curModule.name, curModule.version, curModule.path.replace('.d.ts', '/index.d.ts'));
                            config.delegate.receivedFile?.(dtsCode, path.join('/node_modules', curModule.name, curModule.path.replace('.d.ts', '/index.d.ts')));
                            await resolveDeps(dtsCode, 0, path.join(curModule.path.replace('.d.ts', ''), '/'));
                        } catch(e) {
                        }
                    }
                }
            }
        }

        console.log(estimatedToDownload, estimatedDownloaded);
    }

    async function resolveDeps(initialSourceFile: string, depth: number, curPath: string) {
        const depsToGet = await getNewDependencies(config, initialSourceFile, curPath);

        const files = depsToGet.filter(v => v.relative);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (FileMap.has(path.join(curModule.name, file.path))) {
                // console.log(path.join(curModule.name, file.path));
                continue;
            } else {
                FileMap.set(path.join(curModule.name, file.path), { state: 'loading' });
            }
            estimatedToDownload++;
            try {
                const dtsCode = await getDTSFileForModuleWithVersion(config, curModule.name, curModule.version, file.path);
                config.delegate.receivedFile?.(dtsCode, path.join('/node_modules', curModule.name, file.path));
                await resolveDeps(dtsCode, depth + 1, path.join(file.path, '../'));
            } catch (e) {
                try {
                    const dtsCode = await getDTSFileForModuleWithVersion(config, curModule.name, curModule.version, file.path.replace('.d.ts', '/index.d.ts'));
                    config.delegate.receivedFile?.(dtsCode, path.join('/node_modules', curModule.name, file.path.replace('.d.ts', '/index.d.ts')));
                    await resolveDeps(dtsCode, depth + 1, path.join(file.path.replace('.d.ts', ''), '/'));
                } catch (e) {
                    // console.log(e);
                }
            }
            estimatedDownloaded++;
        }
    }

    async function getNewDependencies(config: ATABootstrapConfig, code: string, curPath: string) {
        const refs = getReferencesForModule(config.typescript, code).map(ref => ({
            ...ref,
            module: mapModuleNameToModule(ref.module),
        }))

        const nodemodulesPkg = refs.filter(v => !v.module.startsWith('.')).filter(v => !moduleMap.has(v.module));

        for (let i = 0; i < nodemodulesPkg.length; i++) {
            const v = nodemodulesPkg[i];
            if (!moduleMap.has(v.module)) {
                moduleMap.set(v.module, { state: 'loading', version: 'latest' })
                modulesToDownload.push(v);
            }
        }
    
        const modules = refs.filter(m => m.module.startsWith('.')).map(v => {
            if (v.module.startsWith('.')) {
                v.path = path.join(curPath, `${v.module}.d.ts`);
                v.relative = true;
            }
            return v;
        })

        return modules
    }
}

const getReferencesForModule = (ts: typeof import("typescript"), code: string) => {
    const meta = ts.preProcessFile(code)

    // Ensure we don't try download TypeScript lib references
    // @ts-ignore - private but likely to never change
    const libMap: Map<string, string> = ts.libMap || new Map()

    // TODO: strip /// <reference path='X' />?

    const references = meta.referencedFiles
        .concat(meta.importedFiles)
        .concat(meta.libReferenceDirectives)
        .filter(f => !f.fileName.endsWith(".d.ts"))
        .filter(d => !libMap.has(d.fileName))
        .filter(d => ['hoist-non-react-statics'].indexOf(d.fileName) === -1)
    
    return references.map(r => {
        let version = undefined
        if (!r.fileName.startsWith(".")) {
            version = "latest"
            const line = code.slice(r.end).split("\n")[0]!
            if (line.includes("// types:")) version = line.split("// types: ")[1]!.trim()
        }

        let module = r.fileName;
        if (!module.startsWith('@') && !module.startsWith('.')) {
            module = module.split('/')[0];
        } else if (module.startsWith('@')) {
            module = module.split('/').slice(0, 2).join('/');
        }

        return {
            module,
            version,
            relative: r.fileName.startsWith('.'),
            path: '',
        }
    })
}

async function dealNodeModules(moduleName: string, config: ATABootstrapConfig) {
    let realName: string = moduleName;
    if (!moduleName.startsWith('@')) {
        realName = moduleName.split('/')[0];
    } else if (realName.startsWith('@')) {
        realName = realName.split('/').slice(0, 2).join('/');
    }

    let res;
    try {
        res = await getDTSFileForModuleWithVersion(config, realName, 'latest', '/package.json');
        config.delegate.receivedFile?.(res, path.join('/node_modules', realName, 'package.json'));
        res = JSON.parse(res);
    } catch (e) {
        res = 'error';
    }

    let types = res.types || res.typings;

    if (res === 'error' || !types) {
        try {
            realName = `@types/${realName}`;
            res = await getDTSFileForModuleWithVersion(config, realName, 'latest', '/package.json');
            config.delegate.receivedFile?.(res, path.join('/node_modules', realName, 'package.json'));
            res = JSON.parse(res);
        } catch (e) {
            res = 'error';
        }
    }

    if (res === 'error') {
        return null;
    }

    types = res.types || res.typings;

    if (types) {
        return {
            name: realName,
            fspath: path.join(realName, types),
            path: path.join('/', types),
            version: res.version,
        }
    }
    return null;
}