import CommandIcon from "@components/icons/command";
import React, { useState } from "react";

interface IStatusBar {
  logoSrc?: string;
  rightActions?: React.ReactNode;
  title?: string;
}
const StatusBar: React.FC<IStatusBar> = ({
  rightActions,
  title = "IDE",
  logoSrc = "//p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/5759801316/fb85/e193/a256/03a81ea60cf94212bbc814f2c82b6940.png",
}) => {
  const [showShortcutInfo, setShowShortcutInfo] = useState(false);

  return (
    <div
      id="music-monaco-editor-root"
      className="music-monaco-editor-status-bar"
    >
      <div
        id="music-monaco-editor-status-bar-left"
        className="music-monaco-editor-status-bar-left"
      >
        <img src={logoSrc} className="music-monaco-editor-status-bar-logo" />
        <div className="music-monaco-editor-status-bar-title">{title}</div>
      </div>
      <div
        id="music-monaco-editor-status-bar-right"
        className="music-monaco-editor-status-bar-right"
      >
        <div>Spaces: 2</div>
        {/* 快捷键提示  */}
        <div
          className="music-monaco-editor-status-bar-shortcut"
          onClick={() => setShowShortcutInfo(!showShortcutInfo)}
        >
          <CommandIcon className="music-monaco-editor-status-bar-shortcut-icon" />
          快捷键
          {showShortcutInfo && (
            <div className="music-monaco-editor-status-bar-shortcut-popup">
              <p>按下 Command+P 进行文件搜索</p>
              <p>按下 Command+SHIFT+F 进行代码搜索</p>
            </div>
          )}
        </div>
        {rightActions}
      </div>
    </div>
  );
};

export default StatusBar;
