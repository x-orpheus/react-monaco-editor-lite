import React from 'react';
import Menu, { Item as MenuItem, ItemGroup as MenuItemGroup, Divider } from 'rc-menu';
import 'rc-menu/assets/index.css';
import './index.css';

const FileMenu: React.FC<{
  isFile: boolean, 
  path: string, 
  disableFileOps?: {
    add?: boolean,
    delete?: boolean,
    rename?: boolean,
  },
  disableFolderOps?: {
    add?: boolean,
    delete?: boolean,
    rename?: boolean,
  },
  handleMenuClick: (info: any, path:string, isFile:boolean) => void }> = (props) => 
{
  const handleMenuClick = (info: any) => {
    props.handleMenuClick(info, props.path, props.isFile);
  }

  const showDelete = props.isFile ? (props.disableFileOps?.delete ? false : true) : (props.disableFolderOps?.delete ? false : true);
  const showRename = props.isFile ? (props.disableFileOps?.rename ? false : true) : (props.disableFolderOps?.rename ? false : true);
  const showAddFile = props.isFile ? false : (props.disableFileOps?.add ? false : true);
  const showAddFolder = props.isFile ? false : (props.disableFolderOps?.add ? false : true);

  if (!showDelete && !showRename && !showAddFile && !showAddFolder) {
    return null;
  }

  return (
    <Menu style={{ width: 200 }} onClick={handleMenuClick} selectedKeys={[]} className='monaco-file-menu'>
       <MenuItemGroup title="Group" className='monaco-item-group'>
        {showAddFile && <MenuItem className='monaco-file-menu-item' key="newFile">新建文件</MenuItem>}
        {showAddFolder && <MenuItem className='monaco-file-menu-item' key="newFolder">新建文件夹</MenuItem>}
        {(showAddFile || showAddFolder) && <Divider />}
        {showDelete && <MenuItem className='monaco-file-menu-item' key="delete">删除</MenuItem>}
        {showRename && <MenuItem className='monaco-file-menu-item' key="editName">重命名</MenuItem>}
      </MenuItemGroup>
    </Menu>
  );
};

export default FileMenu;