import { useCallback } from "react";
import Icon from "@components/icons";
import Close from "@components/icons/close";

const SimpleFile: React.FC<{
  file: any;
  onPathChange: (key: string) => void;
  currentPath?: string;
  onCloseFile: (key: string) => void;
}> = ({ file, onPathChange, currentPath = "", onCloseFile }) => {

  // console.log("file", file);

  const handlePathChange = useCallback(
    (e: any) => {
      const key = e.currentTarget.dataset.src!;
      onPathChange(key);
    },
    [onPathChange]
  );

  let fileType;
  if (file.name && file.name.indexOf(".") !== -1) {
    fileType = `file_type_${file.name.split(".").slice(-1)}`;
  } else {
    fileType = "default_file";
  }

  return (
    <div
      data-src={file.path}
      title={file.path}
      onClick={handlePathChange}
      key={file.path}
      className={`music-monaco-editor-list-file-item-row ${
        currentPath === file.path
          ? "music-monaco-editor-list-file-item-row-focused"
          : ""
      }`}
    >
      <Close
        onClick={(e: Event) => {
          e.stopPropagation();
          onCloseFile(file.path);
        }}
        className="music-monaco-editor-list-close-icon"
      />
      <Icon
        type={fileType}
        style={{
          marginLeft: "14px",
          marginRight: "5px",
        }}
      />
      <span
        style={{ flex: 1 }}
        className="music-monaco-editor-list-file-item-row-name"
      >
        {file.name}
        <span className="music-monaco-editor-list-file-item-row-path">
          {file.path}
        </span>
      </span>
    </div>
  );
};

export default SimpleFile;
