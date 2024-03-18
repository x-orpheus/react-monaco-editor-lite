import React, { useState, useEffect, useCallback } from 'react';
import SearchFileBody from './search-file-body';
import './index.less';

interface SearchFileProps {
  list: string[];
  onSelectFile: (filename: string) => void;
}

const SearchFile: React.FC<SearchFileProps> = (props) => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const filenames = useState(Array.isArray(props.list) ? [...props.list] : [])[0];
  const onSelectFile = props.onSelectFile;

  const handleSearch = (query: string) => {
    if (!query || query.length === 0) {
      setSearchResults([]);
      return;
    }
    const results = filenames.filter((file) =>
      file.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const onExecute = (filename: string) => {
    onSelectFile && onSelectFile(filename);
  };

  return (
    <div className='search-file-background'>
      <div className='search-file-body-back'>
        <SearchFileBody
          onSearch={handleSearch}
          searchResults={searchResults}
          onExecute={onExecute}
        />
      </div>
    </div>
  );
};

export default SearchFile;