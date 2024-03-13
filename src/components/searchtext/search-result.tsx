import React from 'react';
import  SearchFileTitle  from './search-file-title'

interface SearchResultProps {
  searchResults: Array<{ [key: string]: Array<{ code: string }> }>;
  unExpandedTitles: Record<string, boolean>;
  searchText: string;
  selectedRow: { titleIndex: number; rowIndex: number };
  handleRowSelection: (titleIndex: number, title: string, rowIndex: number, row: { code: string }) => void;
  toggleExpand: (expanded: boolean, titleIndex: number) => void;
}

const SearchResult : React.FC<SearchResultProps> = ({
  searchResults,
  unExpandedTitles,
  searchText,
  selectedRow,
  handleRowSelection,
  toggleExpand,
}) => {
    const renderStringWithHighlight = (str: string, highlight: string) => {
        const parts = str.split(highlight);
        return (
          <span>
            {parts.map((part, index) => (
              <span key={index}>
                {part}
                {index !== parts.length - 1 && <span style={{ backgroundColor: '#E9C4AA' }}>{highlight}</span>}
              </span>
            ))}
          </span>
        );
      };
    return (
    <ul className='search-result-list'>
      {searchResults.map((result, titleIndex) => {
        return Object.keys(result ?? {}).map((title) => (
          <li key={titleIndex}>
            <SearchFileTitle
              title={title}
              onExpanded={(expanded: boolean) => toggleExpand(expanded, titleIndex)}
            />
            <ul style={{
              listStyleType: 'none', 
              paddingLeft: 10, 
              display: !unExpandedTitles[titleIndex] ? 'block' : 'none',
              overflow: 'auto'
            }}>
              {searchText && result[title].map((row, rowIndex) => (
                <li 
                  className={titleIndex === selectedRow.titleIndex && rowIndex === selectedRow.rowIndex ? 'search-results-item-selected' : 'search-results-item'}
                  key={rowIndex}
                  onClick={() => handleRowSelection(titleIndex, title, rowIndex, row)}
                >
                   {renderStringWithHighlight(row.code, searchText)}
                </li>
              ))}
            </ul>
          </li>
        ));
      })}
    </ul>
  );
};

export default SearchResult;