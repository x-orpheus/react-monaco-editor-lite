import React from 'react';

const AddFolderIcon:React.FC<{
    className?: string,
    onClick?: (...args: any[]) => void;
}> = ({
    className,
    onClick,
}) => (
    <svg
        className={className}
        onClick={onClick}
        width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7 3H4V0H3v3H0v1h3v3h1V4h3V3zM5.5 7H5V6h.3l.8-.9.4-.1H14V4H8V3h6.5l.5.5v10l-.5.5h-13l-.5-.5V5h1v8h12V6H6.7l-.8.9-.4.1z" fill="currentColor"></path></svg>
);

export default AddFolderIcon;