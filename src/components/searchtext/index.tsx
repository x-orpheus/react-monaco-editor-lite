import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchInput from "./search-input";
import SearchResult from "./search-result";
import "./search-text.less";

interface SearchAndReplaceProps {
  onSelectedLine: (title: string, line: number) => void;
  listFiles: Record<string, string>;
  style?: React.CSSProperties;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SelectedRow {
  titleIndex: number;
  rowIndex: number;
}

type SearchResultType = Record<string, { code: string; line: number }[]>[];

const SearchAndReplace: React.FC<SearchAndReplaceProps> = ({
  onSelectedLine,
  listFiles,
  style,
  onClose,
}) => {
  const [searchText, setSearchText] = useState("");
  const [resultText, setResultText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultType>([]);
  const [unExpandedTitles, setUnExpandedTitles] = useState<
    Record<number, boolean>
  >({});
  const [selectedRow, setSelectedRow] = useState<SelectedRow>({
    titleIndex: -1,
    rowIndex: -1,
  });
  const [allSelectResults, setAllSelectResults] = useState<
    { titleIndex: number; rowIndex: number }[]
  >([]);

  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleSearch();
  }, [resultText, listFiles]);

  useEffect(() => {
    smoothSelectedResults();
  }, [searchResults, unExpandedTitles]);

  const clear = useCallback(() => {
    setSearchResults([]);
    setUnExpandedTitles({});
  }, []);

  const handleSearch = useCallback(() => {
    if (resultText.length === 0) {
      clear();
      return;
    }

    const lsearchResults: SearchResultType = [];
    for (const [key, value] of Object.entries(listFiles)) {
      const matches = value.split("\n");
      if (matches) {
        const matchingSubstrings = [];
        for (let i = 0; i < matches.length; i++) {
          const lineStr = matches[i];
          if (lineStr.toLowerCase().includes(resultText.toLowerCase())) {
            matchingSubstrings.push({ code: lineStr, line: i + 1 });
          }
        }

        if (matchingSubstrings.length > 0) {
          //[key]
          lsearchResults.push({ [key]: matchingSubstrings });
        }
      }
    }
    setSearchResults(lsearchResults);
  }, [resultText, listFiles]);

  const smoothSelectedResults = useCallback(() => {
    const selectedResults: { titleIndex: number; rowIndex: number }[] = [];
    searchResults.forEach((result, titleIndex) => {
      if (!unExpandedTitles[titleIndex] && searchText) {
        Object.keys(result ?? {}).forEach((title) => {
          result[title].forEach((row: any, rowIndex: any) => {
            selectedResults.push({ titleIndex, rowIndex });
          });
        });
      }
    });
    setAllSelectResults(selectedResults);
  }, [unExpandedTitles, searchText, searchResults]);

  const preRow = useCallback(
    (titleIndex: number, rowIndex: number) => {
      const index = allSelectResults.findIndex((item) => {
        return item.titleIndex === titleIndex && item.rowIndex === rowIndex;
      });
      if (index - 1 >= 0) {
        return allSelectResults[index - 1];
      }
      return { titleIndex, rowIndex };
    },
    [allSelectResults]
  );

  const nextRow = useCallback(
    (titleIndex: number, rowIndex: number) => {
      const index = allSelectResults.findIndex(
        (item) => item.titleIndex === titleIndex && item.rowIndex === rowIndex
      );
      if (allSelectResults.length > index + 1) {
        return allSelectResults[index + 1];
      }
      return { titleIndex, rowIndex };
    },
    [allSelectResults]
  );

  const handleKeyDown = useCallback(
    (event: {
      metaKey: any;
      shiftKey: any;
      key: string;
      preventDefault: () => void;
    }) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedRow((pre) => nextRow(pre.titleIndex, pre.rowIndex));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedRow((pre) => preRow(pre.titleIndex, pre.rowIndex));
      }
    },
    [selectedRow, allSelectResults]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setResultText(searchText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  useEffect(() => {
    const current = innerRef?.current as unknown as HTMLElement;
    if (current) {
      current.addEventListener("keydown", handleKeyDown);
      return () => {
        current.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [innerRef, handleKeyDown]);

  useEffect(() => {
    if (
      selectedRow.titleIndex >= 0 &&
      searchResults &&
      searchResults.length > selectedRow.titleIndex
    ) {
      const keys = Object.keys(searchResults[selectedRow.titleIndex]);
      if (keys && keys.length > 0) {
        const title = keys[0];
        const entry =
          searchResults[selectedRow.titleIndex][title][selectedRow.rowIndex];
        onSelectedLine && onSelectedLine(title, entry.line);
      }
    }
  }, [selectedRow]);

  const toggleExpand = (expanded: any, titleIndex: any) => {
    setUnExpandedTitles((prev) => ({
      ...prev,
      [titleIndex]: !expanded,
    }));
    setSelectedRow({ titleIndex: -1, rowIndex: -1 });
  };

  const handleRowSelection = (
    titleIndex: any,
    title: any,
    rowIndex: any,
    row: any
  ) => {
    setSelectedRow({ titleIndex, rowIndex });
  };

  return (
    <div
      ref={innerRef}
      className="music-monaco-editor-list-wrapper"
      style={{
        ...style,
        overflow: "auto",
        background: "var(--monaco-editor-background)",
        display: "flex",
        flexDirection: "column",
      }}
      tabIndex={0}
    >
      <SearchInput
        searchText={searchText}
        setSearchText={setSearchText}
        onClose={onClose}
      />
      <SearchResult
        searchResults={searchResults}
        unExpandedTitles={unExpandedTitles}
        searchText={resultText}
        selectedRow={selectedRow}
        handleRowSelection={handleRowSelection}
        toggleExpand={toggleExpand}
      />
    </div>
  );
};

export default SearchAndReplace;
