import { ATABootstrapConfig } from "."

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
      throw new Error("OK")
    }
}
