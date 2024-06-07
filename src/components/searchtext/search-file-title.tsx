import React, { useState, useCallback } from 'react';
import Icon from '@components/icons';
import Arrow from '@components/icons/arrow';

interface SearchFileTitleProps {
  title: string;
  onExpanded?: (expanded: boolean) => void;
}

const SearchFileTitle: React.FC<SearchFileTitleProps> = (props) => {
  const { title, onExpanded } = props;
  // 默认展开
  const [expanded, setExpanded] = useState(true);

  const renderTitle = (titleText: string) => {
    const fileName = titleText.split('/').pop();
    const fileDir = titleText.split('/').slice(0, -1).join('/');
    let fileType;
    if (fileName && fileName.indexOf('.') !== -1) {
      fileType = `file_type_${fileName.split('.').slice(-1)}`;
    } else {
      fileType = 'default_file';
    }

    return (
      <div className="search-results-title">
        <Arrow collpase={!expanded} />
        <Icon
          type={fileType}
          style={{
            marginLeft: '5px',
            marginRight: '5px',
          }}
        />
        <span className="search-results-file-name">{fileName}</span>
        <span className="search-results-file-path">{fileDir}</span>
      </div>
    );
  };

  const toggleExpand = useCallback(() => {
    setExpanded((prevExpanded) => !prevExpanded);
    onExpanded && onExpanded(!expanded);
  }, [expanded, onExpanded]);

  return (
    <div className="search-results-title" onClick={toggleExpand}>
      {renderTitle(title)}
    </div>
  );
};

export default SearchFileTitle;
