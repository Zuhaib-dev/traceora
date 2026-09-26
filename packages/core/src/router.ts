import { EventEmitter } from "./EventEmitter";

export function setupRouterInstrumentation(emitter: EventEmitter) {
  if (typeof window === "undefined" || !window.history) return;

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  let currentPath = window.location.pathname + window.location.search;

  const emitRouteChange = (newPath: string, type: string) => {
    if (currentPath !== newPath) {
      emitter.emit({
        type: "ROUTE_CHANGE",
        source: "HistoryAPI",
        metadata: {
          from: currentPath,
          to: newPath,
          navigationType: type,
        }
      });
      currentPath = newPath;
    }
  };

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    const newPath = window.location.pathname + window.location.search;
    emitRouteChange(newPath, 'push');
    return result;
  };

  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    const newPath = window.location.pathname + window.location.search;
    emitRouteChange(newPath, 'replace');
    return result;
  };

  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname + window.location.search;
    emitRouteChange(newPath, 'popstate');
  });
}
