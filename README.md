# monaco-base-ide
![img](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/36505433932/638f/06f4/a958/4d82bdeff7c5c5afa437028f68ed1b65.png)
![img2](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/36505435944/01f8/2388/f3e9/bafe10aedf6a954f4ce09bf02c725748.png)

## 如何使用

### 安装

```
npm install react-monaco-editor-lite
```

### 使用

#### 多文件编辑器

```js

import { MultiEditor } from 'react-monaco-editor-lite';

function IDE() {
    const defaultFiles = {
        '/src/app.jsx': `
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

(async () => {
  const {Button} = await import('./Button.jsx');
  const root = document.getElementById('root');
  ReactDOM.render((
    <div>
      <Button>Direct</Button>
    </div>
  ), root);
})();
`,
        '/src/app.css': 'body { background: #fff }',
        '/index.html': `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<div id="root"></div>
<script type="importmap">
    {
    "imports": {
        "react": "https://cdn.skypack.dev/react",
        "react-dom": "https://cdn.skypack.dev/react-dom",
        "lodash": "https://cdn.skypack.dev/lodash"
    }
    }
</script>
<script type="module">
    import './app/index.jsx';
    import './index.js';
</script>
</body>
</html>
                    `,
        '/src/test.ts': `
import { add } from './cc';

const App = () => {
    console.log(add(1, 2));
};

export default App;
`,
        '/src/cc.ts': `
export function add(a, b) {
    return a + b;
}

export function minus(a, b) {
    return a - b;
}
`
    }
    return (
        <div style={{ width: '800px', height: '600px' }}>
            <MultiEditor 
                defaultFiles={defaultFiles}
                options={{
                    fontSize: 14,
                    automaticLayout: true,
                }} />
        </div>
    )
}

export default IDE;
```

#### 单文件编辑器

```js
import { SingleEditor } from 'react-monaco-editor-lite';
import React, { useState } from 'react';

function SingleIDE() {
    const [loc] = useState({
        start: {
            line: 3,
            column: 1
        },
        end: {
            line: 4,
            column: 1
        }
    });
    const [value, setValue] = useState(`
export function add(a, b) {
    return a + b;
}

export function minus(a, b) {
    return a - b;
}
    `);
    const onChange = (v) => {
        setValue(v);
    }

    return (
        <div style={{
            width: '800px',
            height: '800px',
        }}>
            <SingleEditor
                value={value}
                onChange={onChange}
                loc={loc}
                options={{
                }} />
        </div>
    )
};

export default SingleIDE;
```

#### 搜索文件
快捷键：command/ctrl + p

#### 搜索 & 替换文本
快捷键：shift + command/ctrl + f

#### 类型提示声明
MultiEditor 新增属性 extraLibs 配置额外的类型提示配置

#### 文件/目录右键菜单功能
MultiEditor 新增属性 useFileMenu 用于是否启用文件/目录右键菜单功能

### 组件参数及方法

查看此[文档](https://x-orpheus.github.io/react-monaco-editor-lite/public/docs/index.html)
