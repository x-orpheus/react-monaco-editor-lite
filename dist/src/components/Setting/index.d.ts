import React from 'react';
declare const Setting: React.FC<{
    getTarget?: () => HTMLElement | null;
    autoPrettier?: boolean;
    onAutoPrettierChange?: (e: any) => void;
    defaultTheme?: string;
    disablePrettier?: boolean;
}>;
export default Setting;
