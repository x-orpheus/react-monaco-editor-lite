/// <reference types="react" />
declare const TabItem: React.FC<{
    file: {
        status?: string;
        path: string;
        name: string;
        showPrefix?: boolean;
        prefix: string;
    };
    onPathChange?: (key: string) => void;
    currentPath?: string;
    onCloseFile: (key: string) => void;
    rootEl: HTMLElement | null;
    onSaveFile: (path: string) => void;
    onAbortSave: (path: string) => void;
    onCloseOtherFiles: (path: string) => void;
}>;
export default TabItem;
