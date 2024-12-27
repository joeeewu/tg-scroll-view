import type { CSSProperties, ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
}

export interface BaseOptionType {
  [key: string]: any;
}

export interface SharedConfig<T> {
  getKey: (item: T) => React.Key;
}

export type RenderFunc<T> = (
  item: T,
  index: number,
  props: { style: React.CSSProperties; offsetX: number },
) => React.ReactNode;

export type GetKey<T> = (item: T) => React.Key;
