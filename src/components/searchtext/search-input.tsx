import React, { useEffect, useRef } from 'react';
import Close from '@components/icons/close';

interface SearchInputProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchText, setSearchText, onClose }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);
  
  return (
    <div className='search-result-top-search'>
      <input 
        className='search-result-input'
        type="text" 
        ref={inputRef}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)} 
        placeholder="搜索（上下键切换）"
      />
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={() => onClose(false)}
              className="music-monaco-editor--close">
          <Close
            style={{
              width: '12px',
              height: '12px',
            }}
          />
        </div>
    </div>
  );
};

export default SearchInput;