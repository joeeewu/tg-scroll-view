import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import type { ReactNode, Ref } from 'react';
import cs from 'classnames';
import { useUpdateEffect, useMemoizedFn } from 'ahooks';
import ResizeObserver from 'rc-resize-observer';
import type { SizeInfo } from 'rc-resize-observer';
import type { BaseComponentProps, SharedConfig, RenderFunc, GetKey } from 'tg-scroll-view/interfaces';
import { mergeProps } from 'tg-scroll-view/utils/with-default-props';
import Scroller from 'tg-scroll-view/utils/scroller';
import { render } from 'tg-scroll-view/utils/render';
import { nextTick, debounce } from 'tg-scroll-view/utils';
import useHeights from 'tg-scroll-view/hooks/use-heights';
import useChildren from 'tg-scroll-view/hooks/use-children';
import VirtualList from '../virtual-list';
import './index.less';

interface RenderRefreshParams {
  scrollTop: number;
  isRefreshing: boolean;
  isRefreshActive: boolean;
}

interface RenderMoreParams {
  isEndReaching: boolean;
}

interface OnScrollParams {
  scrollLeft: number;
  scrollTop: number;
}

export interface TgScrollViewProps<T> extends Omit<BaseComponentProps, 'children'> {
  scrollingX?: boolean;
  scrollingY?: boolean;
  bouncing?: boolean;
  autoReflow?: boolean;
  manualInit?: boolean;
  endReachedThreshold?: number;
  immediateCheckEndReaching?: boolean;
  touchAngle?: number;
  isPrevent?: boolean;
  children: RenderFunc<T>;
  renderHeader?: () => ReactNode;
  renderRefresh?: (params: RenderRefreshParams) => ReactNode;
  renderMore?: (params: RenderMoreParams) => ReactNode;
  renderFooter?: () => ReactNode;
  onRefreshing?: () => void;
  onRefreshActive?: () => void;
  onEndReached?: () => void;
  onScroll?: (params: OnScrollParams) => void;

  virtual?: boolean;
  itemHeight?: number;
  data: T[];
  itemKey: React.Key | ((item: T) => React.Key);
}

export interface TgScrollViewRef {
  init: () => void;
  reflowScroller: (force: boolean) => void;
  scrollTo: (left: number, top: number, animate?: boolean) => void;
  getOffsets: () => { left: number; top: number };
  triggerRefresh: () => void;
  finishRefresh: () => void;
  finishLoadMore: () => void;
}

const defaultProps = {
  scrollingX: true,
  scrollingY: true,
  bouncing: true,
  autoReflow: false,
  manualInit: false,
  endReachedThreshold: 0,
  immediateCheckEndReaching: false,
  touchAngle: 45,
  isPrevent: true,

  virtual: true,
  onEndReached: () => {},
};

function TgScrollView<T = any>(p: TgScrollViewProps<T>, ref: Ref<TgScrollViewRef>) {
  // 水平方向的滚动距离
  const [scrollX, setScrollX] = useState<number>(0);
  // 垂直方向的滚动距离
  const [scrollY, setScrollY] = useState<number>(0);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isRefreshActive, setRefreshActive] = useState(false);
  const [isEndReachingStart, setEndReachingStart] = useState(false);
  const [isEndReaching, setEndReaching] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const refresherRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<Scroller | null>(null);
  // 刷新模块的高度
  const refreshOffsetYRef = useRef(0);
  // 是否已初始化
  const isInitialedRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const containerWRef = useRef(0);
  const containerHRef = useRef(0);
  const contentWRef = useRef(0);
  const contentHRef = useRef(0);
  const reflowTimerRef = useRef<number | null>(null);
  const endReachedHandlerRef = useRef<(() => void) | null>(null);
  const moreOffsetYRef = useRef(0);

  const props = mergeProps(defaultProps, p);
  const {
    scrollingX,
    scrollingY,
    bouncing,
    manualInit,
    endReachedThreshold,
    autoReflow,
    immediateCheckEndReaching,
    isPrevent,
    touchAngle,
    className,
    children,

    renderHeader,
    renderFooter,
    renderRefresh,
    renderMore,

    onScroll,
    onRefreshActive,
    onRefreshing,
    onEndReached,

    virtual,
    itemHeight,
    data,
    itemKey,
  } = props;

  const _onEndReached = useMemoizedFn(onEndReached);

  const _getScrollerAngle = () => {
    const diffX = currentXRef.current - startXRef.current;
    const diffY = currentYRef.current - startYRef.current;
    const angle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
    return scrollingX ? 90 - angle : angle;
  };

  const _onScrollerTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    // event.target.tagName && event.target.tagName.match(/input|textarea|select/i)
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    startXRef.current = event.targetTouches[0].pageX;
    startYRef.current = event.targetTouches[0].pageY;
    scroller.doTouchStart(event.touches, event.timeStamp);
  };

  const _onScrollerTouchMove = (event: TouchEvent) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    let hadPrevent = false;

    if (isPrevent) {
      event.preventDefault();
      hadPrevent = true;
    }

    currentXRef.current = event.targetTouches[0].pageX;
    currentYRef.current = event.targetTouches[0].pageY;

    if (!scrollingX || !scrollingY) {
      const currentTouchAngle = _getScrollerAngle();
      if (currentTouchAngle < touchAngle) {
        return;
      }
    }

    if (!hadPrevent && event.cancelable) {
      event.preventDefault();
    }

    // @ts-ignore
    scroller.doTouchMove(event.touches, event.timeStamp, event.scale);

    const boundaryDistance = 15;
    const scrollLeft =
      document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;
    const scrollTop =
      document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;

    const pX = currentXRef.current - scrollLeft;
    const pY = currentYRef.current - scrollTop;
    if (
      pX > document.documentElement.clientWidth - boundaryDistance ||
      pY > document.documentElement.clientHeight - boundaryDistance ||
      pX < boundaryDistance ||
      pY < boundaryDistance
    ) {
      scroller.doTouchEnd(event.timeStamp);
    }
  };

  const _onScrollerTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.doTouchEnd(event.timeStamp);
  };

  const _onScrollerMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    startXRef.current = event.pageX;
    startYRef.current = event.pageY;
    scroller.doTouchStart(
      [
        {
          pageX: event.pageX,
          pageY: event.pageY,
        },
      ],
      event.timeStamp,
    );
    isMouseDownRef.current = true;
  };

  const _onScrollerMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const scroller = scrollerRef.current;
    const isMouseDown = isMouseDownRef.current;
    if (!scroller || !isMouseDown) {
      return;
    }

    currentXRef.current = event.pageX;
    currentYRef.current = event.pageY;
    if (!scrollingX || !scrollingY) {
      const currentTouchAngle = _getScrollerAngle();
      if (currentTouchAngle < touchAngle) {
        return;
      }
    }
    scroller.doTouchMove(
      [
        {
          pageX: event.pageX,
          pageY: event.pageY,
        },
      ],
      event.timeStamp,
    );
    isMouseDownRef.current = true;
  };

  const _onScrollerMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const scroller = scrollerRef.current;
    const isMouseDown = isMouseDownRef.current;
    if (!scroller || !isMouseDown) {
      return;
    }
    scroller.doTouchEnd(event.timeStamp);
    isMouseDownRef.current = false;
  };

  const _destroyAutoReflow = () => {
    const reflowTimer = reflowTimerRef.current;
    reflowTimer && clearInterval(reflowTimer);
  };

  const _checkScrollerEnd = () => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const containerHeight = scroller._clientHeight;
    const content = scroller._contentHeight;
    const top = scroller._scrollTop;
    const moreOffsetY = moreOffsetYRef.current;
    const moreThreshold = endReachedThreshold;
    const endOffset = content - containerHeight - (top + moreOffsetY + moreThreshold);
    const endReachedHandler = endReachedHandlerRef.current;

    if (top >= 0 && !isEndReaching && endOffset <= 0 && endReachedHandler) {
      // First prepare for "load more" state
      setEndReachingStart(true);
      // Second enter "load more" state
      // & trigger endReached event only once after the rebounding animation
      endReachedHandler();
    }
  };

  const _onScroll = (left: number, top: number) => {
    left = +left.toFixed(2);
    top = +top.toFixed(2);

    if (scrollX === left && scrollY === top) {
      return;
    }
    setScrollX(left);
    setScrollY(top);
    _checkScrollerEnd();
    onScroll?.({ scrollLeft: left, scrollTop: top });
  };

  const reflowScroller = (force = false) => {
    const container = containerRef.current;
    const content = contentRef.current;
    const scroller = scrollerRef.current;

    if (!scroller || !container || !content) {
      return;
    }

    nextTick(() => {
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const contentW = content.offsetWidth;
      const contentH = content.offsetHeight;

      if (
        force ||
        containerWRef.current !== containerW ||
        containerHRef.current !== containerH ||
        contentWRef.current !== contentW ||
        contentHRef.current !== contentH
      ) {
        scroller.setDimensions(
          container.clientWidth,
          container.clientHeight,
          content.offsetWidth,
          content.offsetHeight,
        );
        containerWRef.current = containerW;
        containerHRef.current = containerH;
        contentWRef.current = contentW;
        contentHRef.current = contentH;
      }
    });
  };

  const _initAutoReflow = () => {
    _destroyAutoReflow();
    // @ts-ignore
    reflowTimerRef.current = setInterval(() => {
      reflowScroller();
    }, 100);
  };

  const _initScroller = () => {
    const isInitialed = isInitialedRef.current;
    if (isInitialed) {
      return;
    }
    const container = containerRef.current as HTMLDivElement;
    const content = container.querySelector('.scroll-view-content') as HTMLDivElement;
    const refresher = container.querySelector('.scroll-view-refresh') as HTMLDivElement;
    const more = container.querySelector('.scroll-view-more') as HTMLDivElement;

    contentRef.current = content;
    refresherRef.current = refresher;
    moreRef.current = more;

    refreshOffsetYRef.current = refresher ? refresher.clientHeight : 0;
    moreOffsetYRef.current = more ? more.clientHeight : 0;

    const rect = container.getBoundingClientRect();
    const scroller = new Scroller(
      (left: number, top: number) => {
        render(content, left, top);
        if (isInitialedRef.current) {
          _onScroll(left, top);
        }
      },
      {
        scrollingX,
        scrollingY,
        bouncing,
        zooming: false,
        animationDuration: 200,
        speedMultiplier: 1.2,
        inRequestAnimationFrame: true,
      },
    );
    scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);
    if (typeof renderRefresh === 'function') {
      const refreshOffsetY = refreshOffsetYRef.current;
      scroller.activatePullToRefresh(
        refreshOffsetY,
        () => {
          setRefreshActive(true);
          setRefreshing(false);
          onRefreshActive?.();
        },
        () => {
          setRefreshActive(false);
          setRefreshing(false);
        },
        () => {
          setRefreshActive(false);
          setRefreshing(true);
          onRefreshing?.();
        },
      );
    }
    scrollerRef.current = scroller;
    reflowScroller(true);
    autoReflow && _initAutoReflow();
    endReachedHandlerRef.current = debounce(() => {
      setEndReaching(true);
      _onEndReached?.();
    }, 50);

    setTimeout(() => {
      isInitialedRef.current = true;
    }, 50);

    if (immediateCheckEndReaching) {
      nextTick(_checkScrollerEnd);
    }
  };

  const init = () => {
    nextTick(() => {
      _initScroller();
    });
  };

  const scrollTo = (left: number, top: number, animate = false) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.scrollTo(left, top, animate);
  };

  const getOffsets = () => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return { left: 0, top: 0 };
    }
    return scroller.getValues();
  };

  const triggerRefresh = () => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.triggerPullToRefresh();
  };

  const finishRefresh = () => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.finishPullToRefresh();
    reflowScroller();
  };

  const finishLoadMore = () => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    setEndReachingStart(false);
    setEndReaching(false);
    reflowScroller();
  };

  useImperativeHandle(ref, () => ({
    init,
    reflowScroller,
    scrollTo,
    getOffsets,
    triggerRefresh,
    finishRefresh,
    finishLoadMore,
  }));

  useUpdateEffect(() => {
    if (autoReflow) {
      _initAutoReflow();
    } else {
      _destroyAutoReflow();
    }
  }, [autoReflow]);

  useEffect(() => {
    if (!manualInit) {
      _initScroller();
    }
    return () => {
      _destroyAutoReflow();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    container.addEventListener('touchmove', _onScrollerTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchmove', _onScrollerTouchMove);
    };
  }, []);

  const getKey = useCallback<GetKey<T>>(
    (item: T) => {
      if (typeof itemKey === 'function') {
        return itemKey(item);
      }
      return (item as any)?.[String(itemKey)];
    },
    [itemKey],
  );

  const sharedConfig: SharedConfig<T> = {
    getKey,
  };

  const [size, setSize] = useState({ width: 0, height: 0 });
  const mergedData = data || [];
  const height = size.height;
  const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights(
    getKey,
  );

  const onContainerResize = (sizeInfo: SizeInfo) => {
    setSize({
      width: sizeInfo.offsetWidth,
      height: sizeInfo.offsetHeight,
    });
  };

  const fillerInnerRef = useRef<HTMLDivElement>(null);
  const containerHeight = useMemo(
    () => Object.values(heights.maps).reduce((total, curr) => total + curr, 0),
    [heights.id, heights.maps],
  );
  const useVirtual = !!(virtual && itemHeight);
  const inVirtual =
    useVirtual && data && Math.max(itemHeight * data.length, containerHeight) > height;

  const {
    scrollHeight,
    start,
    end,
    offset: fillerOffset,
  } = React.useMemo(() => {
    if (!useVirtual) {
      return {
        scrollHeight: 0,
        start: 0,
        end: mergedData.length - 1,
        offset: undefined,
      };
    }

    // Always use virtual scroll bar in avoid shaking
    if (!inVirtual) {
      return {
        scrollHeight: fillerInnerRef.current?.offsetHeight || 0,
        start: 0,
        end: mergedData.length - 1,
        offset: undefined,
      };
    }

    let itemTop = 0;
    let startIndex: number | null = null;
    let startOffset: number;
    let endIndex: number | null = null;

    const dataLen = mergedData.length;
    for (let i = 0; i < dataLen; i += 1) {
      const item = mergedData[i];
      const key = getKey(item);

      const cacheHeight = heights.get(key);
      const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);

      // Check item top in the range
      if (currentItemBottom >= scrollY && startIndex === null) {
        startIndex = i;
        startOffset = itemTop;
      }

      // Check item bottom in the range. We will render additional one item for motion usage
      if (currentItemBottom > scrollY + height && endIndex === null) {
        endIndex = i;
      }

      itemTop = currentItemBottom;
    }

    // When scrollTop at the end but data cut to small count will reach this
    if (startIndex === null) {
      startIndex = 0;
      startOffset = 0;
      endIndex = Math.ceil(height / itemHeight);
    }

    if (endIndex === null) {
      endIndex = mergedData.length - 1;
    }

    // 多渲染一个提高体验，如果超过了最大值则设置为最大值
    endIndex = Math.min(endIndex + 1, mergedData.length - 1);

    return {
      scrollHeight: itemTop,
      start: startIndex,
      end: endIndex,
      // @ts-ignore
      offset: startOffset,
    };
  }, [inVirtual, useVirtual, scrollY, mergedData, heightUpdatedMark, height]);

  const listChildren = useChildren(
    mergedData,
    start,
    end,
    scrollX,
    setInstanceRef,
    children,
    sharedConfig,
  );

  return (
    <ResizeObserver onResize={onContainerResize}>
      <div
        className={cs('tg-scroll-view', className)}
        ref={containerRef}
        onTouchStart={_onScrollerTouchStart}
        onTouchEnd={_onScrollerTouchEnd}
        onTouchCancel={_onScrollerTouchEnd}
        onMouseDown={_onScrollerMouseDown}
        onMouseMove={_onScrollerMouseMove}
        onMouseUp={_onScrollerMouseUp}
        onMouseLeave={_onScrollerMouseUp}
      >
        {typeof renderHeader === 'function' ? (
          <div className="scroll-view-header">{renderHeader()}</div>
        ) : null}
        <div className={cs('scroll-view-content', { horizon: scrollingX && !scrollingY })}>
          {typeof renderRefresh === 'function' ? (
            <div
              className={cs('scroll-view-refresh', {
                refreshing: isRefreshing,
                'refresh-active': isRefreshActive,
              })}
            >
              {renderRefresh({ scrollTop: scrollY, isRefreshing, isRefreshActive })}
            </div>
          ) : null}
          <VirtualList
            ref={fillerInnerRef}
            height={scrollHeight}
            onInnerResize={collectHeight}
            offsetY={fillerOffset}
          >
            {listChildren}
          </VirtualList>
          {typeof renderMore === 'function' ? (
            <div
              className={cs('scroll-view-more', { active: isEndReachingStart || isEndReaching })}
            >
              {renderMore({ isEndReaching: isEndReachingStart || isEndReaching })}
            </div>
          ) : null}
        </div>
        {typeof renderFooter === 'function' ? (
          <div className="scroll-view-footer">{renderFooter()}</div>
        ) : null}
      </div>
    </ResizeObserver>
  );
}

export default forwardRef(TgScrollView);
