import React from 'react';
declare const Setting: React.FC<{
    getTarget?: () => HTMLElement | null;
    autoPrettier?: boolean;
    onAutoPrettierChange?: (e: any) => void;
}>;
export default Setting;
