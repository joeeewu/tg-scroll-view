import { isProd } from './env';

export function noop() {}

export function nextTick(func: () => void) {
  setTimeout(func, 0);
}

export const warn = (msg, fn = 'error') => {
  // eslint-disable-next-line no-console
  !isProd && console[fn](`[Tikiiit Go]: ${msg}`);
};

export function extend(to, _from) {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}

export function debounce(fn = noop, delay = 300) {
  let timer = null;

  return function () {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
