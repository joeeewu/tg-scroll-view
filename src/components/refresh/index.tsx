import React, { useMemo, useRef } from 'react';
import { mergeProps } from 'tg-scroll-view/utils/with-default-props';
import TgActivityIndicatorRolling from 'tg-scroll-view/components/activity-indicator/roller';
import './index.less';

interface ScrollViewRefreshProps {
  scrollTop?: number;
  isRefreshing?: boolean;
  isRefreshActive?: boolean;
  refreshText?: string;
  refreshActiveText?: string;
  refreshingText?: string;
  rollerColor?: string;
}

const defaultProps = {
  scrollTop: 0,
  isRefreshing: false,
  isRefreshActive: false,
  refreshText: '下拉刷新',
  refreshActiveText: '释放刷新',
  refreshingText: '刷新中...',
  rollerColor: '#7C4DFF',
};

function ScrollViewRefresh(p: ScrollViewRefreshProps) {
  const domRef = useRef<HTMLDivElement>(null);
  const props = mergeProps(defaultProps, p);
  const {
    scrollTop,
    isRefreshing,
    isRefreshActive,
    refreshText,
    refreshActiveText,
    refreshingText,
    rollerColor,
  } = props;

  const process = useMemo(() => {
    const container = domRef.current;
    if (!container || !scrollTop) {
      return +scrollTop;
    }

    const refreshHeight = container.clientHeight;

    if (Math.abs(scrollTop) < refreshHeight / 2) {
      return 0;
    }
    // first 1/3 is not included in progress
    return (Math.abs(scrollTop) - refreshHeight / 2) / (refreshHeight / 2);
  }, [scrollTop]);

  const refreshTip = useMemo(() => {
    if (isRefreshing) {
      return refreshingText;
    }
    if (isRefreshActive) {
      return refreshActiveText;
    }
    return refreshText;
  }, [isRefreshing, refreshingText, isRefreshActive, refreshActiveText, refreshText]);

  return (
    <div className="tg-scroll-view-refresh" ref={domRef}>
      <TgActivityIndicatorRolling
        process={!isRefreshing ? process : undefined}
        width={10}
        color={rollerColor}
      />
      <div className="tg-scroll-view-refresh-tip">{refreshTip}</div>
    </div>
  );
}

export default ScrollViewRefresh;
