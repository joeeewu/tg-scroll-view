import React, { useCallback, cloneElement } from 'react';

export interface VirtualItemProps {
  children: React.ReactElement;
  setRef: (element: HTMLElement) => void;
}

export function VirtualItem({ children, setRef }: VirtualItemProps) {
  const refFunc = useCallback((node: HTMLElement) => {
    setRef(node);
  }, []);

  return cloneElement(children, {
    ref: refFunc,
  });
}
