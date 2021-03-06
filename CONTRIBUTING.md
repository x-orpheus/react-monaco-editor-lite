# monaco-base-ide

### 使用

提供了两个IDE，Editor和MultiEditor.

Editor的作用主要是提供同时只需要单独编辑一个文件的场景。内部通过monaco-modal实现单monaco实例，多文件切换的行为，非常简单的包装。

MultiEditor提供了多文件目录导航的功能。

该组件由于内部状态较多，故不提供受控，仅通通过forwardRef进行各种命令的暴露。建议通过命令式的方法进行操作

### 如何用cloudide开发

该项目已经在[cloudide平台](https://st.music.163.com/st/idestudio/)上运行，

我创建的一个实例在[这里](https://st.music.163.com/st/idestudio/openide?ideId=iaf7410d82e6b&projectName=monaco-editor-playground),

[demo](http://dev-iaf7410d82e6b-ide.igame.163.com/)可以在此处预览

### 如何贡献代码

由于集成了typedoc, conventional-changelog工具，某些行为需要特定命令进行触发，故提供工作流程以供参考，操作正确的话，将会自动生成文档和changelog

1. git checkout -b [feature | fix]/ [ xxx ]

2. change code

3. git commit changes, pull master

3. npm version prerelease --preid=beta

4. nenpm publish --tag=beta

5. merge code to master

6. npm version [ patch | minor | major ]

7. nenpm publish
