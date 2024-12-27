import React from 'react';
import { mergeProps } from 'tg-scroll-view/utils/with-default-props';
import './index.less';

interface ScrollViewMoreProps {
  loadingText?: string;
  finishedText?: string;
  isFinished?: boolean;
}

const defaultProps = {
  loadingText: '更多加载中...',
  finishedText: '全部已加载',
  isFinished: false,
};

function ScrollViewMore(p: ScrollViewMoreProps) {
  const props = mergeProps(defaultProps, p);
  const { isFinished, loadingText, finishedText } = props;
  return <div className="tg-scroll-view-more">{!isFinished ? loadingText : finishedText}</div>;
}

export default ScrollViewMore;
