import React from 'react';
import cs from 'classnames';
import TgScrollView from '../src/components/scroll-view';
import './basic.less';

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

for (let i = 0; i < 20; i += 1) {
  data.push(genItem());
}

function Basic() {
  return (
    <>
      <h3>基本使用</h3>
      <TgScrollView data={data} itemKey="uuid" className="basic-scroll-view">
        {(item, index) => {
          return (
            <div
              className={cs(
                'basic-scroll-view-item',
                { 'basic-scroll-view-item-last': index === data.length - 1 },
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
