import React from "react";
import SampleFile from "./simple-file";
import Close from "@components/icons/close";

interface IOpenFilePanel {
  openedFiles: any;
  filetree: any;
  onPathChange: (key: string) => void;
  currentPath?: string;
  onCloseFile: (key: string) => void;
}

const OpenFilePanel: React.FC<IOpenFilePanel> = ({
  openedFiles,
  filetree,
  onPathChange,
  currentPath,
  onCloseFile,
}) => {
  console.log("openedFiles", openedFiles, "filetree", filetree);

  return (
    <div className="open-file-panel">
      <div className="panel-header">
        <span>打开的编辑器</span>
        <Close
          onClick={() => onCloseFile("")}
          style={{
            cursor: "pointer",
            width: "12px",
          }}
        >
          关闭所有
        </Close>
      </div>
      <div className="panel-body">
        {openedFiles.map((file: any) => (
          <SampleFile
            key={file.path}
            onPathChange={onPathChange}
            onCloseFile={onCloseFile}
            currentPath={currentPath}
            file={{
              ...file,
              name: file.path.split("/").slice(-1)[0],
              _isFile: true,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default OpenFilePanel;
