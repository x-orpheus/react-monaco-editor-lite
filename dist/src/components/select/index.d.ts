import React from 'react';
import Menu from './components/menu';
import './index.less';
interface SelectInterface extends React.FC<{
    defaultValue?: string;
    onChange?: (value: string) => void;
    getContainer?: () => HTMLElement | null;
    children?: React.ReactNode;
    value?: string;
}> {
    Menu: typeof Menu;
}
declare const Select: SelectInterface;
export default Select;
