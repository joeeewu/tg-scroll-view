import React, { PropsWithChildren } from 'react';
import { mergeProps } from 'tg-scroll-view/utils/with-default-props';
import './roller.less';

const defaultProps = {
  size: 70,
  color: '#7C4DFF',
  borderColor: 'rgba(0, 0, 0, .1)',
  fill: 'transparent',
  linecap: 'round',
  rotate: 0,
};

interface TgActivityIndicatorRollingProps {
  size?: number;
  width?: number;
  color?: string;
  borderColor?: string;
  fill?: string;
  linecap?: 'butt' | 'round' | 'square' | 'inherit';
  rotate?: number;
  process?: number | void; // 0-1
}

function TgActivityIndicatorRolling(p: PropsWithChildren<TgActivityIndicatorRollingProps>) {
  const props = mergeProps(defaultProps, p);
  const { size, width, color, borderColor, fill, linecap, rotate, children, process } = props;
  const strokeWidth = width || size / 12;
  const viewBoxSize = size + 2 * strokeWidth;
  const duration = 2;
  const radius = size / 2;
  const isAutoAnimation = process === undefined;
  const circlePerimeter = size * 3.1415;
  const strokeDasharray = `${process * circlePerimeter} ${(1 - process) * circlePerimeter}`;
  return (
    <div className="tg-activity-indicator-rolling">
      <div className="rolling-container">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={{ width: `${size}px`, height: `${size}px`, transform: `rotateZ(${rotate}deg)` }}
          preserveAspectRatio="xMidYMid"
          className="tg-activity-indicator-svg rolling"
        >
          <circle
            fill="none"
            stroke={borderColor}
            strokeWidth={strokeWidth}
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
          />
          <g
            // v-if="!$slots.circle"
            className="circle"
          >
            {isAutoAnimation || process > 0 ? (
              <circle
                className="stroke"
                cx={viewBoxSize / 2}
                cy={viewBoxSize / 2}
                fill={fill}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={
                  isAutoAnimation ? `${(110 * circlePerimeter) / 125}` : strokeDasharray
                }
                strokeLinecap={linecap}
                r={radius}
              >
                {isAutoAnimation ? (
                  <animate
                    attributeName="stroke-dashoffset"
                    values={`${(360 * circlePerimeter) / 125};${(140 * circlePerimeter) / 125}`}
                    dur="2.2s"
                    keyTimes="0;1"
                    calcMode="spline"
                    fill="freeze"
                    keySplines="0.41,0.314,0.8,0.54"
                    repeatCount="indefinite"
                    begin="0"
                  />
                ) : null}
                {isAutoAnimation ? (
                  <animateTransform
                    dur={`${duration}s`}
                    values={`0 ${viewBoxSize / 2} ${viewBoxSize / 2};360 ${viewBoxSize / 2} ${viewBoxSize / 2}`}
                    attributeName="transform"
                    type="rotate"
                    calcMode="linear"
                    keyTimes="0;1"
                    begin="0"
                    repeatCount="indefinite"
                  />
                ) : null}
              </circle>
            ) : null}
          </g>
          {/* <slot name="circle" v-else></slot> */}
          {/* <slot name="defs"></slot> */}
        </svg>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default TgActivityIndicatorRolling;
