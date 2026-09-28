import React from 'react';

/**
 * Keeps date/time dependent UI reactive without remounting the application tree.
 * Refreshes on minute boundaries and immediately when the tab returns to the foreground.
 */
export function useLocalNow(): Date {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    let timer: number | undefined;

    const schedule = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      const current = new Date();
      const delay = 60_000 - (current.getSeconds() * 1_000 + current.getMilliseconds());
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, Math.max(1, delay));
    };

    const refresh = () => {
      if (document.visibilityState === 'visible') setNow(new Date());
    };

    schedule();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return now;
}
