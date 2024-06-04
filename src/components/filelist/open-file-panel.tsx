import React from "react";
import SampleFile from "./simple-file";
import Close from "@components/icons/close";
import CloseAll from "@components/icons/close-all";

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
  // console.log("openedFiles", openedFiles, "filetree", filetree);

  return (
    <div className="open-file-panel">
      <div className="panel-header">
        <span>打开的编辑器</span>
        <CloseAll
        className="panel-header-icon"
          onClick={() => onCloseFile("")}
          style={{
            cursor: "pointer",
            width: "16px",
          }}
        />
      </div>
      <div className="panel-body">
        {openedFiles?.length > 0 ? (
          openedFiles.map((file: any) => (
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
          ))
        ) : (
          <div className="empty">编辑器中暂无打开文件</div>
        )}
      </div>
    </div>
  );
};

export default OpenFilePanel;
