import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchInput from "./search-input";
import SearchResult from "./search-result";
import "./search-text.less";
import Modal from "@components/modal";

interface SearchAndReplaceProps {
  onSelectedLine: (title: string, line: number) => void;
  listFiles: Record<string, string>;
  style?: React.CSSProperties;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  onReplace: (listFiles: Record<string, string>) => void;
  rootEl: React.MutableRefObject<null>;
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
  onReplace,
  rootEl,
}) => {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
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
  const [collpase, setCollpase] = useState(false);

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

  const replaceAll = useCallback(() => {
    let length = 0;
    searchResults.forEach((item) => {
      for (const [key, values] of Object.entries(item)) {
        length += values.length;
      }
    });

    Modal.confirm({
      target: rootEl.current,
      okText: "确定",
      onOk: (ok: () => void) => {
        for (const [key, value] of Object.entries(listFiles)) {
          handleReplaceFile(key, value);
        }
        onReplace(listFiles);
        ok();
      },
      title: "确定要全部替换吗？",
      content: () => (
        <div>
          <div>
            涉及 {searchResults.length} 文件，共 {length} 行
          </div>
        </div>
      ),
    });
  }, [replaceText, listFiles, searchResults]);

  const handleReplaceLine = useCallback(
    (fileName: string, line: number) => {
      const matches = listFiles[fileName].split("\n");
      if (matches && matches.length > line - 1) {
        let regex = new RegExp(searchText, "gi");
        matches[line - 1] = matches[line - 1].replace(regex, replaceText);
        listFiles[fileName] = matches.join("\n");
      }
      onReplace(listFiles);
    },
    [replaceText, listFiles]
  );

  const handleReplaceFile = useCallback(
    (fileName: string, code: string) => {
      const matches = code.split("\n");
      searchResults.forEach((result) => {
        for (const [resultKey, resultValues] of Object.entries(result)) {
          if (resultKey === fileName) {
            resultValues.forEach((resultValue) => {
              if (matches && matches.length > resultValue.line - 1) {
                let regex = new RegExp(searchText, "gi");
                matches[resultValue.line - 1] = resultValue.code.replace(
                  regex,
                  replaceText
                );
              }
            });
          }
        }
      });
      const newValue = matches.join("\n");
      listFiles[fileName] = newValue;
    },
    [replaceText, listFiles]
  );

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
    (event: KeyboardEvent) => {
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
        if (entry) {
          onSelectedLine && onSelectedLine(title, entry?.line);
        }
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
    rowIndex: any,
  ) => {
    setSelectedRow({ titleIndex, rowIndex });
  };

  const replaceRowSelection = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (
      selectedRow.titleIndex >= 0 &&
      searchResults &&
      searchResults.length > selectedRow.titleIndex
    ) {
      event.preventDefault();
      event.stopPropagation();
      const keys = Object.keys(searchResults[selectedRow.titleIndex]);
      if (keys && keys.length > 0) {
        const key = keys[0];
        const entry =
          searchResults[selectedRow.titleIndex][key][selectedRow.rowIndex];
        if (entry) {
          setSelectedRow({ titleIndex: -1, rowIndex: -1 });
          handleReplaceLine(key, entry.line);
        }
      }
    }
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
        replaceText={replaceText}
        setReplaceText={setReplaceText}
        onClose={onClose}
        onReplace={replaceAll}
        collpase={collpase}
        setCollpase={setCollpase}
      />
      <SearchResult
        searchResults={searchResults}
        unExpandedTitles={unExpandedTitles}
        searchText={resultText}
        selectedRow={selectedRow}
        handleRowSelection={handleRowSelection}
        toggleExpand={toggleExpand}
        replaceRowSelection={replaceRowSelection}
        canReplace={collpase}
      />
    </div>
  );
};

export default SearchAndReplace;
