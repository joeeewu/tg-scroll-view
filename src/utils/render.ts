import { root, inBrowser } from './env';

/* istanbul ignore file */
export const render = (function (global) {
  // for ssr
  if (!inBrowser) {
    return function (content: HTMLElement, left: number, top: number) {
      content.style.marginLeft = left ? `${-left}px` : '';
      content.style.marginTop = top ? `${-top}px` : '';
    };
  }
  const docStyle = document.documentElement.style;

  let engine = '';

  // @ts-ignore
  if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
    engine = 'presto';
  } else if ('MozAppearance' in docStyle) {
    engine = 'gecko';
  } else if ('WebkitAppearance' in docStyle) {
    engine = 'webkit';
  // @ts-ignore
  } else if (typeof navigator.cpuClass === 'string') {
    engine = 'trident';
  }

  const vendorPrefix = {
    trident: 'ms',
    gecko: 'Moz',
    webkit: 'Webkit',
    presto: 'O',
  }[engine];

  const helperElem = document.createElement('div');
  const perspectiveProperty = `${vendorPrefix}Perspective` as keyof CSSStyleDeclaration;
  const transformProperty = `${vendorPrefix}Transform` as keyof CSSStyleDeclaration;

  if (helperElem.style[perspectiveProperty] !== undefined) {
    return function (content: HTMLElement, left: number, top: number, zoom = 1, useNativeDriver = true) {
      if (useNativeDriver) {
        content.style[transformProperty as any] = `translate3d(${-left}px,${-top}px,0) scale(${zoom})`;
      } else {
        content.style[transformProperty as any] = `translate(${-left}px,${-top}px) scale(${zoom})`;
      }
    };
  }
  if (helperElem.style[transformProperty] !== undefined) {
    return function (content: HTMLElement, left: number, top: number, zoom = 1) {
      content.style[transformProperty as any] = `translate(${-left}px,${-top}px) scale(${zoom})`;
    };
  }
  return function (content: HTMLElement, left: number, top: number, zoom?: number) {
    content.style.marginLeft = left ? `${-left}px` : '';
    content.style.marginTop = top ? `${-top}px` : '';
    // @ts-ignore
    content.style.zoom = zoom || '';
  };
})(root);
