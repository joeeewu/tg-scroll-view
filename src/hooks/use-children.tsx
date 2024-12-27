import * as React from 'react';
import { VirtualItem } from 'tg-scroll-view/components/virtual-item';
import type { SharedConfig, RenderFunc } from '../interfaces';

export default function useChildren<T>(
  list: T[],
  startIndex: number,
  endIndex: number,
  offsetX: number,
  setNodeRef: (item: T, element: HTMLElement) => void,
  renderFunc: RenderFunc<T>,
  { getKey }: SharedConfig<T>,
) {
  return list.slice(startIndex, endIndex + 1).map((item, index) => {
    const eleIndex = startIndex + index;
    const node = renderFunc(item, eleIndex, {
      offsetX,
      style: {},
    }) as React.ReactElement;

    const key = getKey(item);
    return (
      <VirtualItem key={key} setRef={(ele: HTMLElement) => setNodeRef(item, ele)}>
        {node}
      </VirtualItem>
    );
  });
}
