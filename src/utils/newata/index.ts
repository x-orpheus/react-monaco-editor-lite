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

function isntNil<T>(value: T): value is NonNullable<T> {
    return value !== null;
  }

export const setupTypeAcquisition = (config: ATABootstrapConfig) => {
    const moduleMap = new Map<string, ModuleMeta>()
    const FileMap = new Map<string, FileMeta>()
    const fsMap = new Map<string, string>()
    const modulesToDownload:any[] = [];
    let curModule: {
        name: string,
        fspath: string,
        path: string,
        version: string,
    };
  
    let estimatedToDownload = 0
    let estimatedDownloaded = 0
  
    return (initialSourceFile: string) => {
      estimatedToDownload = 0
      estimatedDownloaded = 0
  
      resolveDeps(initialSourceFile, 0, '').then(t => {
        if (estimatedDownloaded > 0) {
          config.delegate.finished?.(fsMap)
        }
      })
    }

    async function resolveDeps(initialSourceFile: string, depth: number, curPath: string) {
        const depsToGet = getNewDependencies(config, moduleMap, initialSourceFile, curPath);

        const nodemodulesPkg = depsToGet.filter(v => !v.relative);

        const files = depsToGet.filter(v => v.relative);

        const entries = (await Promise.all(nodemodulesPkg.map(v => dealNodeModules(v.module, config)))).filter(isntNil);

        entries.forEach(dep => {
            if (!moduleMap.get(dep.name)) {
                moduleMap.set(dep.name, { state: 'loading', version: dep.version })
                modulesToDownload.push(dep);
            }
        });
    
        console.log(files, entries, depth, curPath);

        if (modulesToDownload.length >= 1 && files.length === 0) {
            curModule = modulesToDownload.shift();
            const dtsCode = await getDTSFileForModuleWithVersion(config, curModule.name, curModule.version, curModule.path);
            await resolveDeps(dtsCode, depth + 1, path.join(curModule.path, '../'));
        } else if (files.length > 0) {
            await Promise.all(files.map(async file => {
                const dtsCode = await getDTSFileForModuleWithVersion(config, curModule.name, curModule.version, file.path);
                await resolveDeps(dtsCode, depth + 1, path.join(file.path, '../'));
            }))
        } else {
            return;
        }
    }
}

function getNewDependencies(config: ATABootstrapConfig, moduleMap: Map<string, ModuleMeta>, code: string, curPath: string) {
    const refs = getReferencesForModule(config.typescript, code).map(ref => ({
      ...ref,
      module: mapModuleNameToModule(ref.module),
    }))
  
    const modules = refs.filter(m => !moduleMap.has(m.module)).map(v => {
        if (v.module.startsWith('.')) {
            v.path = path.join(curPath, `${v.module}.d.ts`);
            v.relative = true;
        }
        return v;
    })
    return modules
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
  
    return references.map(r => {
      let version = undefined
      if (!r.fileName.startsWith(".")) {
        version = "latest"
        const line = code.slice(r.end).split("\n")[0]!
        if (line.includes("// types:")) version = line.split("// types: ")[1]!.trim()
      }
  
      return {
        module: r.fileName,
        version,
        relative: r.fileName.startsWith('.'),
        path: '',
      }
    })
}

async function dealNodeModules(moduleName: string, config: ATABootstrapConfig) {
    let realName:string = moduleName;
    if (!moduleName.startsWith('@')) {
        realName = moduleName.split('/')[0];
    }

    let res;
    try {
        res = await getDTSFileForModuleWithVersion(config, realName, 'latest', '/package.json');
    } catch (e) {
        res = 'error';
    }

    if (res === 'error') {
        try {
            res = await getDTSFileForModuleWithVersion(config, `@types/${realName}`, 'latest', '/package.json');
        } catch (e) {
            res = 'error';
        }
    }

    if (res === 'error') {
        return null;
    }

    res = JSON.parse(res);

    if (res.types) {
        return {
            name: realName,
            fspath: path.join(realName, res.types),
            path: path.join('/', res.types),
            version: res.version,
        }
    }
    return null;
}