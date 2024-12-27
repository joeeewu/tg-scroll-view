import React from 'react';
import cs from 'classnames';
import TgScrollView from '../src/components/scroll-view';
import './virtual.less';

interface DataItem {
  name: string;
  uuid: number;
}

let uuid = 0;

function genItem() {
  const item = {
    name: `key_${uuid}`,
    uuid,
  };
  uuid += 1;
  return item;
}

const data: DataItem[] = [];

for (let i = 0; i < 1000; i += 1) {
  data.push(genItem());
}

function Virtual() {
  return (
    <>
      <h3>虚拟滚动</h3>
      <TgScrollView
        data={data}
        itemKey="uuid"
        itemHeight={50}
        autoReflow
        scrollingX={false}
        className="virtual-scroll-view"
      >
        {(item, index) => {
          return (
            <div
              className={cs(
                'virtual-scroll-view-item',
                { 'virtual-scroll-view-item-last': index === data.length - 1 },
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

export default Virtual;
