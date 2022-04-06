import React, { useEffect, useState } from 'react';
import Modal from '@components/modal';
import Select from '@components/select';
import Close from '@components/icons/close';
import SettingIcon from '@components/icons/setting';
import { configTheme } from '@utils/initEditor';
import { THEMES } from '@utils/consts';

const Setting: React.FC<{
    getTarget?: () => HTMLElement | null,
    autoPrettier?: boolean,
    onAutoPrettierChange?: (e: any) => void,
    defaultTheme?: string,
    disablePrettier?: boolean,
}> = ({
    getTarget,
    autoPrettier,
    onAutoPrettierChange,
    defaultTheme = 'OneDarkPro',
    disablePrettier = false,
}) => {
    const [visible, setVisible] = useState(false);
    const [theme, setTheme] = useState(defaultTheme);

    useEffect(() => {
        configTheme(defaultTheme);
    // eslint-disable-next-line
    }, []);

    return (
        <React.Fragment>
            <div
                className="music-monaco-editor-setting-button"
                onClick={() => setVisible(true) }>
                <SettingIcon
                    style={{
                        width: '20px',
                        height: '20px',
                    }} />
            </div>
            <Modal
                destroyOnClose
                onClose={() => setVisible(false) }
                visible={visible}
                getTarget={getTarget}>
                <div className="music-monaco-editor-setting">
                    <div className="music-monaco-editor-setting-header">
                        设置
                        <div
                            onClick={() => setVisible(false)}
                            className="music-monaco-editor-setting-header-close">
                            <Close style={{
                                width: '12px',
                                height: '12px'
                            }} />
                        </div>
                    </div>
                    <div className="music-monaco-editor-setting-content">
                        {
                            disablePrettier ? null : (
                                <div className="music-monaco-editor-input-row">
                                    <div className="music-monaco-editor-input-name">
                                        prettier
                                    </div>
                                    <div className="music-monaco-editor-input-value">
                                        <input
                                            defaultChecked={autoPrettier}
                                            type="checkbox"
                                            onChange={onAutoPrettierChange}/>
                                        <label>prettier on save</label>
                                    </div>
                                </div>
                            )
                        }
                        <div className="music-monaco-editor-input-row">
                            <div className="music-monaco-editor-input-name">
                                主题选择
                            </div>
                            <div className="music-monaco-editor-input-value">
                                <Select
                                    getContainer={getTarget}
                                    defaultValue={theme}
                                    onChange={(v) => {
                                        setTheme(v.value);
                                        configTheme(v.value);
                                    }}>
                                    {
                                        THEMES.map(theme => (
                                            <Select.Menu label={theme} value={theme} key={theme} />
                                        ))
                                    }
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    )
}

export default Setting;
