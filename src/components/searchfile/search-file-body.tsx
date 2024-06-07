import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import Icon from '@components/icons';

interface SearchModalProps {
  onSearch: (query: string) => void;
  searchResults: string[];
  onExecute: (result: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  onSearch,
  searchResults,
  onExecute,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    if (searchResults.length > 0 && modalRef.current) {
      const selectedItemElement = modalRef.current.childNodes[
        selectedItem
      ] as HTMLElement;
      if (selectedItemElement) {
        selectedItemElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedItem, searchResults]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.id === 'file-search-input') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedItem((prev) => (prev + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedItem(
          (prev) => (prev - 1 + searchResults.length) % searchResults.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onExecute(searchResults[selectedItem]);
      }
    }
  };

  const onClickLine = (index: number) => {
    setSelectedItem(index);
    onExecute(searchResults[index]);
  };

  const getFileType = (filename: string) => {
    const fileName = filename.split('/').pop();
    let fileType;
    if (fileName && fileName.indexOf('.') !== -1) {
      fileType = `file_type_${fileName.split('.').slice(-1)}`;
    } else {
      fileType = 'default_file';
    }
    return fileType;
  };

  return (
    <div className="search-file-modal-overlay">
      <div className="search-file-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-file-input"
          id="file-search-input"
          type="text"
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
            setSelectedItem(0);
            onSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for files..."
        />
        {searchResults.length > 0 && (
          <ul
            ref={modalRef}
            style={{
              listStyleType: 'none',
              padding: 0,
              maxHeight: '500px',
              overflowY: 'auto',
            }}
          >
            {searchResults.map((result, index) => (
              <li
                className={
                  index === selectedItem
                    ? 'search-file-result-item-selected'
                    : 'search-file-result-item'
                }
                key={index}
                onClick={() => onClickLine(index)}
              >
                <Icon
                  type={getFileType(result)}
                  style={{
                    marginLeft: '5px',
                    marginRight: '5px',
                  }}
                />
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
