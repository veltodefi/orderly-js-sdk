export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean,
): (this: ThisParameterType<T>, ...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args); // 'this' is inherited correctly in an arrow function
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
}
