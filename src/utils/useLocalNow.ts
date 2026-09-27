import React from 'react';

export const nextMinuteDelay = (now: Date) => 60_000 - (now.getSeconds() * 1_000 + now.getMilliseconds());
export const shouldRefreshLocalClock = (visibilityState: DocumentVisibilityState) => visibilityState === 'visible';

export const useLocalNow = () => {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      const current = new Date();
      timer = setTimeout(() => {
        if (cancelled) return;
        setNow(new Date());
        schedule();
      }, nextMinuteDelay(current) + 25);
    };
    const refresh = () => {
      if (shouldRefreshLocalClock(document.visibilityState)) setNow(new Date());
      schedule();
    };

    schedule();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return now;
};
