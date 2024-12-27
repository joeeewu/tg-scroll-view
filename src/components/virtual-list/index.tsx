import React, { forwardRef } from 'react';
import type { CSSProperties, Ref } from 'react';
import ResizeObserver from 'rc-resize-observer';
import type { SizeInfo } from 'rc-resize-observer';
import './index.less';

interface VirtualListProps {
  /** Virtual filler height. Should be `count * itemMinHeight` */
  height: number;
  /** Set offset of visible items. Should be the top of start item position */
  offsetY?: number;
  onInnerResize?: () => void;
  children: React.ReactNode;
}

function VirtualList(props: VirtualListProps, ref: Ref<HTMLDivElement>) {
  const { onInnerResize, offsetY, children, height } = props;

  let outerStyle: CSSProperties = {};
  let innerStyle: CSSProperties = {};

  if (offsetY !== undefined) {
    // Not set `width` since this will break `sticky: right`
    outerStyle = {
      height,
      position: 'relative',
      overflow: 'hidden',
    };

    innerStyle = {
      ...innerStyle,
      transform: `translateY(${offsetY}px)`,
      // [rtl ? 'marginRight' : 'marginLeft']: -offsetX,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
    };
  }

  const onResize = ({ offsetHeight }: SizeInfo) => {
    if (offsetHeight && onInnerResize) {
      onInnerResize();
    }
  };

  return (
    <div className="tg-virtual-list-outer" style={outerStyle}>
      <ResizeObserver onResize={onResize}>
        <div ref={ref} className="tg-virtual-list-inner" style={innerStyle}>
          {children}
        </div>
      </ResizeObserver>
    </div>
  );
}

export default forwardRef(VirtualList);
