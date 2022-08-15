export declare function deepCopy<T>(obj: T): T;
export declare function generateFileTree(files: any): {
    isDirectory: boolean;
    children: {};
    path: string;
};
export declare function addSourceFile(sourcetree: any, path: string, value?: string): any;
export declare function deleteSourceFile(sourcetree: any, path: string): any;
export declare function editSourceFileName(sourcetree: any, path: string, name: string): any;
export declare function addSourceFolder(sourcetree: any, path: string, value?: string): any;
export declare function deleteSourceFolder(sourcetree: any, path: string): any;
export declare function editSourceFolderName(sourcetree: any, path: string, name: string): any;
export declare function getOldNewPath(oldpath: string, newname: string): {
    oldpath: string;
    newpath: string;
};
export declare function createOrUpdateModel(path: string, value: string): void;
export declare function initFiles(files: any): void;
export declare function deleteModel(path: string): void;
export declare const copyDataToClipBoard: (data: string, callback?: ((res: boolean) => void) | undefined) => void;
export declare const worker: Promise<Worker>;
export declare const setMonacoSyntasValidation: (disable: boolean) => void;
