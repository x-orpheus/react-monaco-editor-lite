import { ATABootstrapConfig } from "."

//  https://github.com/jsdelivr/data.jsdelivr.com

export const getNPMVersionsForModule = (config: ATABootstrapConfig, moduleName: string) => {
  const url = `https://data.jsdelivr.com/v1/package/npm/${moduleName}`
  return api<{ tags: Record<string, string>; versions: string[] }>(config, url, { cache: "no-store" })
}

export const getNPMVersionForModuleReference = (config: ATABootstrapConfig, moduleName: string, reference: string) => {
  const url = `https://data.jsdelivr.com/v1/package/resolve/npm/${moduleName}@${reference}`
  return api<{ version: string | null }>(config, url)
}

export type NPMTreeMeta = { default: string; files: Array<{ name: string }>; moduleName: string; version: string }

function formatRes(res: any, files:any[] = []) {
  if (res.type === 'directory') {
    for (let i = 0; i < res.files.length; i++) {
      formatRes(res.files[i], files);
    }
  } else if (res.type === 'file') {
    files.push({
      name: res.path,
      hash: res.integrity,
      time: res.lastModified,
      size: res.size,
    })
  }
}

export const getFiletreeForModuleWithVersion = async (
  config: ATABootstrapConfig,
  moduleName: string,
  version: string
) => {
  // const url = `https://data.jsdelivr.com/v1/package/npm/${moduleName}@${version}/flat`
  const url = `https://unpkg.fn.netease.com/${moduleName}@${version}/?meta`;
  const res = await api(config, url)
  if (res instanceof Error) {
    return res
  } else {
    const files: any[] = [];
    formatRes(res, files);
    // console.log(files);
    // return {};
    return {
      files,
      moduleName,
      version,
    }
  }
}

export const getDTSFileForModuleWithVersion = async (
  config: ATABootstrapConfig,
  moduleName: string,
  version: string,
  file: string
) => {
  // file comes with a prefix / 
  // const url = `https://cdn.jsdelivr.net/npm/${moduleName}@${version}${file}`
  const url = `https://unpkg.fn.netease.com/${moduleName}@${version}${file}`

  const f = config.fetcher || fetch
  const res = await f(url)
  if (res.ok) {
    return res.text()
  } else {
    return new Error("OK")
  }
}

function api<T>(config: ATABootstrapConfig, url: string, init?: RequestInit): Promise<T | Error> {
  const f = config.fetcher || fetch

  return f(url, init).then(res => {
    if (res.ok) {
      return res.json().then(f => f as T)
    } else {
      return new Error("OK")
    }
  })
}
