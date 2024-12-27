import { isProd } from './env';

export function noop() {}

export function nextTick(func: () => void) {
  setTimeout(func, 0);
}

export const warn = (msg: string, fn = 'error') => {
  // eslint-disable-next-line no-console
  // @ts-ignore
  !isProd && console[fn](`[Tikiiit Go]: ${msg}`);
};

export function extend(to: any, _from: any) {
  for (const key in _from) {
    if (Object.prototype.hasOwnProperty.call(_from, key)) {
      to[key] = _from[key];
    }
  }
  return to;
}

export function debounce(fn = noop, delay = 300) {
  let timer: any = null;

  return function () {
    // @ts-ignore
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      // @ts-ignore
      fn.apply(context, args);
    }, delay);
  };
}
