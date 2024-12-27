import { root } from './env';

const Animate = (global => {
  const time =
    Date.now ||
    (() => {
      return +new Date();
    });
  const desiredFrames = 60;
  const millisecondsPerSecond = 1000;

  let running: { [key: number]: any } = {};
  let counter = 1;

  return {
    /**
     * A requestAnimationFrame wrapper / polyfill.
     *
     * @param callback {Function} The callback to be invoked before the next repaint.
     * @param root {HTMLElement} The root element for the repaint
     */
    requestAnimationFrame: (() => {
      // Check for request animation Frame support
      const requestFrame =
        global.requestAnimationFrame ||
        // @ts-ignore
        global.webkitRequestAnimationFrame ||
        // @ts-ignore
        global.mozRequestAnimationFrame ||
        // @ts-ignore
        global.oRequestAnimationFrame;
      let isNative = !!requestFrame;

      if (
        requestFrame &&
        !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())
      ) {
        isNative = false;
      }

      if (isNative) {
        return (callback: () => void, element?: Element) => {
          // @ts-ignore
          requestFrame(callback, element);
        };
      }

      const TARGET_FPS = 60;
      let requests: { [key: number]: Function } = {};
      let requestCount = 0;
      let rafHandle = 1;
      let intervalHandle: any = null;
      let lastActive = +new Date();

      return (callback: () => void) => {
        const callbackHandle = rafHandle++;

        // Store callback
        requests[callbackHandle] = callback;
        requestCount++;

        // Create timeout at first request
        if (intervalHandle === null) {
          intervalHandle = setInterval(() => {
            const timestamp = +new Date();
            const currentRequests = requests;

            // Reset data structure before executing callbacks
            requests = {};
            requestCount = 0;

            for (const key in currentRequests) {
              if (currentRequests.hasOwnProperty(key)) {
                currentRequests[key](timestamp);
                lastActive = timestamp;
              }
            }

            // Disable the timeout when nothing happens for a certain
            // period of time
            if (timestamp - lastActive > 2500) {
              clearInterval(intervalHandle);
              intervalHandle = null;
            }
          }, 1000 / TARGET_FPS);
        }

        return callbackHandle;
      };
    })(),

    /**
     * Stops the given animation.
     *
     * @param id {Integer} Unique animation ID
     * @return {Boolean} Whether the animation was stopped (aka, was running before)
     */
    stop(id) {
      const cleared = running[id] != null;
      cleared && (running[id] = null);
      return cleared;
    },

    /**
     * Whether the given animation is still running.
     *
     * @param id {Integer} Unique animation ID
     * @return {Boolean} Whether the animation is still running
     */
    isRunning(id: number) {
      return running[id] != null;
    },

    /**
     * Start the animation.
     *
     * @param stepCallback {Function} Pointer to function which is executed on every step.
     *   Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
     * @param verifyCallback {Function} Executed before every animation step.
     *   Signature of the method should be `function() { return continueWithAnimation; }`
     * @param completedCallback {Function}
     *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
     * @param duration {Integer} Milliseconds to run the animation
     * @param easingMethod {Function} Pointer to easing function
     *   Signature of the method should be `function(percent) { return modifiedValue; }`
     * @param root {Element ? document.body} Render root, when available. Used for internal
     *   usage of requestAnimationFrame.
     * @return {Integer} Identifier of animation. Can be used to stop it any time.
     */
    start(stepCallback: Function, verifyCallback: Function, completedCallback: Function, duration?: number, easingMethod?: Function, element?: Element) {
      const start = time();
      let lastFrame = start;
      let percent = 0;
      let dropCounter = 0;
      const id = counter++;

      // Compacting running db automatically every few new animations
      if (id % 20 === 0) {
        const newRunning: { [key: number]: any } = {};
        for (const usedId in running) {
          newRunning[usedId] = true;
        }
        running = newRunning;
      }

      // This is the internal step method which is called every few milliseconds
      const step = (virtual?: boolean) => {
        // Normalize virtual value
        const render = virtual !== true;

        // Get current time
        const now = time();

        // Verification is executed before next animation step
        if (!running[id] || (verifyCallback && !verifyCallback(id))) {
          running[id] = null;
          completedCallback &&
            completedCallback(
              desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond),
              id,
              false,
            );
          return;
        }

        // For the current rendering to apply let's update omitted steps in memory.
        // This is important to bring internal state variables up-to-date with progress in time.
        if (render) {
          const droppedFrames =
            Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
          for (let j = 0; j < Math.min(droppedFrames, 4); j++) {
            step(true);
            dropCounter++;
          }
        }

        // Compute percent value
        if (duration) {
          percent = (now - start) / duration;
          if (percent > 1) {
            percent = 1;
          }
        }

        // Execute step callback, then...
        let value = easingMethod ? easingMethod(percent) : percent;
        value = isNaN(value) ? 0 : value;
        if ((stepCallback(value, now, render) === false || percent === 1) && render) {
          running[id] = null;
          completedCallback &&
            completedCallback(
              desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond),
              id,
              percent === 1 || duration == null,
            );
        } else if (render) {
          lastFrame = now;
          this.requestAnimationFrame(step, element);
        }
      };

      // Mark as running
      running[id] = true;

      // Init first step
      this.requestAnimationFrame(step, element);

      // Return unique animation ID
      return id;
    },
  };
})(root);

export const easeOutCubic = (pos: number) => {
  return (pos - 1) ** 3 + 1;
};

export const easeInOutCubic = (pos: number) => {
  if ((pos /= 0.5) < 1) {
    return 0.5 * pos ** 3;
  }

  return 0.5 * ((pos - 2) ** 3 + 2);
};

export default Animate;
