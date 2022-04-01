import React, { useState } from 'react';
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
}> = ({
    getTarget,
    autoPrettier,
    onAutoPrettierChange,
}) => {
    const [visible, setVisible] = useState(false);
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
                        <div className="music-monaco-editor-input-row">
                            <div className="music-monaco-editor-input-name">
                                主题选择
                            </div>
                            <div className="music-monaco-editor-input-value">
                                <Select defaultValue="OneDarkPro" onChange={(v) => configTheme(v.value)}>
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
