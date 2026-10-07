import { debounce } from '../utils';

describe('event debounce with the real UUID generator', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('runs immediately when debounce is not configured', () => {
    const callback = jest.fn();
    debounce(callback)({ id: 'event' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('coalesces the same event in the same module', () => {
    const callback = jest.fn();
    const run = debounce(callback);
    run({ id: 'event', debounce: 50 }, 'first');
    run({ id: 'event', debounce: 50 }, 'second');
    jest.advanceTimersByTime(49);
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][1]).toBe('second');
  });

  it('keeps identical event IDs isolated between modules', () => {
    const callback = jest.fn();
    const run = debounce(callback);
    run({ id: 'event', debounce: 50 }, undefined, undefined, 'module-a');
    run({ id: 'event', debounce: 50 }, undefined, undefined, 'module-b');
    jest.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('generates independent UUID timer keys when event IDs are absent', () => {
    const callback = jest.fn();
    const run = debounce(callback);
    run({ debounce: 50 }, 'first');
    run({ debounce: 50 }, 'second');
    jest.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls.map((args) => args[1])).toEqual(['first', 'second']);
  });
});
