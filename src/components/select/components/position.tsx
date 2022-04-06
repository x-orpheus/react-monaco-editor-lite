import React, { useEffect } from "react";
import ReactDom from 'react-dom';

const Position:React.FC<{
    instance: HTMLElement,
    children?: React.ReactNode,
    targetRef: React.RefObject<HTMLElement>,
    getContainer?: () => HTMLElement | null,
    onNotVisibleArea?: () => void,
}> = ({
    instance,
    targetRef,
    children = null,
    getContainer,
    onNotVisibleArea = () => ({}),
}) => {
    const container = getContainer && getContainer() || document.body;

    useEffect(() => {
        container.appendChild(instance);

        return () => {
            if (container.contains(instance)) {
                container.removeChild(instance);
            }
        }
    }, [instance, container]);

    useEffect(() => {
        function setInstanceStyle() {
            const { top, left, height, width } = targetRef.current!.getBoundingClientRect();
            const { top: top1, left: left1 } = container.getBoundingClientRect();
            const style = {
                top: container.scrollTop + (top - top1) + height + 1 + 'px',
                left: container.scrollLeft + (left - left1) + 'px',
            }
            instance.style.top = style.top;
            instance.style.left = style.left;
            instance.style.width = width + 'px';
            return { top, left, height }
        }
        setInstanceStyle();

        function handleScroll() {
            const { top, height } = setInstanceStyle();
            
            if (container.offsetTop > top) {
                onNotVisibleArea();
            }
            if (top - container.offsetTop + height > container.offsetHeight) {
                onNotVisibleArea();
            }
        }

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
        }
    }, [targetRef, container]);

    return ReactDom.createPortal(children, instance);
};

export default Position;
