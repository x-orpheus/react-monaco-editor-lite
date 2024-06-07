import React, { useEffect, useRef, useState } from 'react';
import Close from '@components/icons/close';
import Replace from '@components/icons/replace';
import Arrow from '@components/icons/arrow';

interface SearchInputProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  replaceText: string;
  setReplaceText: React.Dispatch<React.SetStateAction<string>>;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  onReplace: () => void;
  expand: boolean;
  setExpand: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchText,
  setSearchText,
  replaceText,
  setReplaceText,
  onClose,
  onReplace,
  expand,
  setExpand,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <div className="search-result-top-search">
      <div
        className="search-result-replace-switch"
        onClick={() => setExpand((pre) => !pre)}
      >
        <Arrow collpase={!expand} />
      </div>
      <div className="search-result-search-innner">
        <div className="search-result-search-container">
          <input
            className="search-result-input"
            type="text"
            ref={inputRef}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索（上下键切换）"
          />
          <div
            onClick={() => onClose(false)}
            className="music-monaco-editor-close"
          >
            <Close
              style={{
                width: '12px',
                height: '12px',
              }}
            />
          </div>
        </div>

        {expand && (
          <div className="search-result-search-replace-container">
            <input
              className="search-result-input-replace"
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="替换"
            />
            <div onClick={onReplace} className="music-monaco-editor-replace">
              <Replace
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
