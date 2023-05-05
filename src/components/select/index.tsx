import React, { useCallback, useEffect, useRef, useState } from 'react';
import Arrow from '@components/icons/arrow';
import Menu from './components/menu';
import Position from './components/position';
import './index.less';

const instance = document.createElement('div');
instance.className = "music-monaco-editor-select-items";

interface SelectInterface extends React.FC<{
    defaultValue?: string,
    onChange?: (value: string) => void,
    getContainer?: () => HTMLElement | null,
    children?: React.ReactNode,
    value?: string,
}> {
    Menu: typeof Menu
}

const Select:SelectInterface = ({
    defaultValue,
    onChange = () => ({}),
    getContainer,
    children,
    value: valueFromProps,
}) => {
    const isControlled = typeof valueFromProps !== 'undefined';
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const value = isControlled ? valueFromProps : internalValue;

    const [visible, setVisible] = useState(false);
    const [data, setData] = useState<{ value: any; label: string }>({ value: defaultValue, label: ''});
    const targetRef = useRef<HTMLDivElement>(null);
    const container = (getContainer && getContainer()) || document.body;

    useEffect(() => {
        if (!children) return;
        const childs = React.Children.toArray(children);
        for (let i = 0; i < childs.length; i++) {
            const child = childs[i];
            if (React.isValidElement(child)) {
                if (child.props.value === value) {
                    setData(child.props);
                    break;
                }
            }
        }
    }, [value, children]);

    useEffect(() => {
        return () => {
            if (container.contains(instance)) {
                container.removeChild(instance);
            }
        }
    }, [container]);

    const handleSelect = useCallback((data: any) => {
        if (!isControlled) {
            setInternalValue(data.value);
        }
        setData(data);
        setVisible(false);
        onChange && onChange(data.value);
    }, [onChange, isControlled]);

    return (
        <React.Fragment>
            <div
                ref={targetRef}
                className="music-monaco-editor-select">
                <div className="music-monaco-editor-select-content" onClick={(e) => {
                    e.stopPropagation();
                    setVisible(pre => !pre)
                }}>
                    {data.label}
                    <div className="music-monaco-editor-select-content-arrow">
                        <Arrow collpase={!visible} />
                    </div>
                </div>
            </div>
            {
                visible && (
                    <Position
                        instance={instance}
                        targetRef={targetRef}
                        getContainer={getContainer}>
                        {
                            React.Children.toArray(children).map(child => (
                                React.isValidElement(child) ? React.cloneElement(child, {
                                    // @ts-ignore
                                    defaultValue: data.value,
                                    handleSelect,
                                }) : child
                            ))
                        }
                    </Position>
                )
            }
        </React.Fragment>
    )
}

Select.Menu = Menu;

export default Select;
