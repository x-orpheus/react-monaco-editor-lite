import ReactDOM from 'react-dom';
import { MouseEvent, useCallback, useState, } from 'react';
import Editor from '../src/single';

export const App = () => {
    const [value, setValue] = useState('console.log("test")');

    const handleClick = (e: MouseEvent<HTMLLIElement>) => {
        const src = e.currentTarget!.dataset.src;
        fetch(`/editorfiles/${src}`).then(v => v.text()).then((content) => {
            setValue(content);
        });
    };

    const handleChange = useCallback((e) => {
        setValue(e);
    }, []);
    
    const handleBlur = useCallback((e) => {
        console.log(e);
    }, []);

    const [language, setLanguage] = useState('javascript');

    return (
        <div>
            <li
                data-src="styles/index.less"
                onClick={(e) => {
                    handleClick(e);
                    setLanguage('less');
                }}>
                fn.js
            </li>
            <li
                data-src="app.js"
                onClick={(e) => {
                    handleClick(e);
                    setLanguage('javascript');
                }}>
                app.js
            </li>
            <li
                data-src="cc.js"
                onClick={(e) => {
                    handleClick(e);
                    setLanguage('javascript');
                }}>
                cc.js
            </li>
            <div style={{ width: '800px', height: '600px' }}>
                <Editor
                    loc={
                        {
                            start: {
                                line: 4,
                                column: 1,
                            },
                            end: {
                                line: 5,
                                column: 1,
                            }
                        }
                    }
                    value={value}
                    // defaultValue={value}
                    language="javascript"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={{
                        language: language,
                        fontSize: 14,
                        automaticLayout: true,
                    }} />
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("single"));