/// <reference types="react" />
declare const File: React.FC<{
    getAllFiles: () => any;
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
    file: any;
    onPathChange: (key: string) => void;
    root: boolean;
    currentPath?: string;
    onAddFile: (...args: any[]) => void;
    onConfirmAddFile: (...args: any[]) => void;
    onDeleteFile: (...args: any[]) => void;
    onEditFileName: (...args: any[]) => void;
    onConfirmAddFolder: (...args: any[]) => void;
    onAddFolder: (...args: any[]) => void;
    onDeleteFolder: (...args: any[]) => void;
    onEditFolderName: (...args: any[]) => void;
}>;
export default File;
