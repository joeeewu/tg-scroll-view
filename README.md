# tg-scroll-view

[![NPM version](https://img.shields.io/npm/v/tg-scroll-view.svg?style=flat)](https://npmjs.org/package/tg-scroll-view)
[![NPM downloads](http://img.shields.io/npm/dm/tg-scroll-view.svg?style=flat)](https://npmjs.org/package/tg-scroll-view)

用于模拟原生的滚动区域，支持下拉刷新和加载更多，并支持虚拟滚动

## Usage

- `Refresh`为组件库内置的下拉刷新组件，仅用于作为视觉展示，需在`renderRefresh`中使用，下拉刷新组件也可自定义
- `More`为组件库内置的加载更多组件，仅用于作为视觉展示，需在`renderMore`中使用，加载更多组件也可自定义
- 组件容器默认高度为100%，也可以通过传入`className`或者`style`属性自定义高度，否则会出现无法滚动或回弹问题

## Online Preview

https://tg-scroll-view.wuxiaozhou.top

## Development

```bash
# install dependencies
$ pnpm install

# develop library by docs demo
$ pnpm start

# build library source code
$ pnpm run build

# build library source code in watch mode
$ pnpm run build:watch

# build docs
$ pnpm run docs:build

# Locally preview the production build.
$ pnpm run docs:preview

# check your project for potential problems
$ pnpm run doctor
```

## API

### TgScrollView Props

| 属性         | 说明        | 类型         | 默认值       | 备注        |
| :----------- | :----------- | :----------- | :----------- | :----------- |
| data | 数据数组 | object[] |||
| children | 生成复杂数据的渲染函数，参数分别为当前数据的值，当前行索引，当前props | (item, index, props) => ReactElement |||
| itemHeight | 元素的最小高度 | number |||
| itemKey | 元素的唯一标识 | string |||
| scrollingX | 水平滚动 | boolean | true ||
| scrollingY | 垂直滚动 | boolean | true ||
| bouncing | 可回弹 | boolean | true ||
| autoReflow | 内容发生变化时自动重置滚动区域尺寸 | boolean | false | 当设置为`false`时，内容发生变化需手动调用`reflowScroller` |
| manualInit | 手动初始化 | boolean | false | 一般用于异步初始化的场景，需手动调用`init`方法完成初始化 |
| endReachedThreshold | 触发到达底部的提前量 | number | 0 | 单位`px` |
| immediateCheckEndReaching | 初始化时立即触发是否到达底部检查 | boolean | false |  |
| touchAngle | 触发滚动的角度范围 | number | 45 | 单位`deg` |
| isPrevent | 阻止浏览器默认滚动 | boolean | true | 如果设置为`false`，当在非可滚动角度范围触发滚动时会触发浏览器默认滚动 |
| onScroll | 滚动事件 | (params: { scrollLeft: number, scrollTop: number }) => void |  |  |
| onRefreshActive | 释放可刷新事件 | () => void |  |  |
| onRefreshing | 刷新中事件 | () => void |  |  |
| onEndReached | 滚动触底事件 | () => void |  |  |

### TgScrollView Ref

| 参数         | 说明        | 类型         | 备注        |
| :----------- | :----------- | :----------- | :----------- |
| init | 初始化滚动区域，当`manualInit`设置为`true`时使用 | () => void ||
| reflowScroller | 重置滚动区域，一般滚动区域中的内容发生变化之后需调用 | () => void ||
| scrollTo | 滚动至指定位置 | (left: number, top: number, animate? = false) => void ||
| getOffsets | 获取滚动位置 | () => ({ left: number, top: number }) ||
| triggerRefresh | 触发下拉刷新 | () => void ||
| finishRefresh | 停止下拉刷新 | () => void ||
| finishRefresh | 停止加载更多 | () => void ||

### Refresh Props

| 属性         | 说明        | 类型         | 默认值       | 备注        |
| :----------- | :----------- | :----------- | :----------- | :----------- |
| scrollTop | 距离顶部距离 | number | 0 | 单位`px` |
| isRefreshActive | 释放可刷新状态 | boolean | false |  |
| isRefreshing | 刷新中状态 | boolean | false |  |
| refreshText | 待刷新文案 | string | 下拉刷新 |  |
| refreshActiveText | 释放可刷新文案 | string | 释放刷新 |  |
| refreshingText | 刷新中文案 | string | 刷新中... |  |
| rollerColor | 进度条颜色 | string | #7C4DFF |  |

### More Props

| 属性         | 说明        | 类型         | 默认值       | 备注        |
| :----------- | :----------- | :----------- | :----------- | :----------- |
| isFinished | 全部已加载 | boolean | false ||
| loadingText | 加载中文案 | boolean | 更多加载中... ||
| finishedText | 全部已加载文案 | boolean | 全部已加载 ||

## LICENSE

MIT
