import React, { useState, useRef, useEffect } from 'react';
import cs from 'classnames';
import TgScrollView, { TgScrollViewRef } from '../src';
import './reset-more.less';

interface IDataItem {
  name: number | string;
  id: number;
}

let index = 0;

function Basic() {
  const [isFinished, setIsFinished] = useState(false);
  const [data, setData] = useState<IDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<TgScrollViewRef>(null);

  const onRefreshing = async () => {
    if (isLoading) return;
    console.log('onRefreshing');
    index = 0;
    setIsFinished(false);
    setIsLoading(true);
    setTimeout(() => {
      const newData: IDataItem[] = [];
      Array.from({ length: 10 }, (v, i) => {
        newData.push({ name: i, id: i });
      });
      index++;
      setData(newData);
      scrollViewRef.current?.finishRefresh();
      setIsLoading(false);
    }, 3000);
  };

  const onEndReached = async () => {
    if (isLoading) return;
    if (isFinished) return;
    console.log('onEndReached');
    setIsLoading(true);
    setTimeout(() => {
      const newData: IDataItem[] = [];
      Array.from({ length: 10 }, (v, i) => {
        newData.push({ name: index * 10 + i, id: index * 10 + i });
      });
      index++;
      setData(pre => {
        const current = pre.concat(newData);
        if (current.length > 100) {
          setIsFinished(true);
        }
        return current;
      });
      scrollViewRef.current?.finishLoadMore();
      setIsLoading(false);
    }, 3000);
  };

  useEffect(() => {
    const newData: IDataItem[] = [];
    Array.from({ length: 10 }, (v, i) => {
      newData.push({ name: i, id: i });
    });
    index++;
    setData(newData);
  }, []);

  return (
    <>
      <h3>滚动区域/下拉刷新</h3>
      <TgScrollView
        ref={scrollViewRef}
        data={data}
        itemKey="id"
        className="reset-more-scroll-view"
        autoReflow
        scrollingX={false}
        renderRefresh={({ scrollTop, isRefreshing, isRefreshActive }) => (
          <TgScrollView.Refresh
            scrollTop={scrollTop}
            isRefreshing={isRefreshing}
            isRefreshActive={isRefreshActive}
          />
        )}
        renderMore={({ isEndReaching }) => {
          console.log(isEndReaching);
          return <TgScrollView.More isFinished={isFinished} />
        }}
        onRefreshing={onRefreshing}
        onEndReached={onEndReached}
      >
        {(item, index) => {
          return (
            <div
              className={cs(
                'reset-more-scroll-view-item',
                { 'reset-more-scroll-view-item-last': index === data.length - 1 },
              )}
            >
              {item.name}
            </div>
          );
        }}
      </TgScrollView>
    </>
  );
}

export default Basic;
