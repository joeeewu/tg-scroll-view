import { attachPropertiesToComponent } from './utils/attach-properties-to-component';
import TgScrollView from './components/scroll-view';
import Refresh from './components/refresh';
import More from './components/more';
export type { TgScrollViewProps, TgScrollViewRef } from './components/scroll-view'

export default attachPropertiesToComponent(TgScrollView, {
  Refresh,
  More,
});
