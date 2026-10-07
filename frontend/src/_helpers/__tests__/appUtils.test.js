import {
  addToLocalStorage,
  getDataFromLocalStorage,
  getDateTimeFormat,
  getRGBAValueFromHex,
  hexToRgba,
  hexToRgb,
  deepCamelCase,
  removeFunctionObjects,
  isTruthyOrZero,
} from '../appUtils';

describe('current application utility API', () => {
  beforeEach(() => localStorage.clear());

  it('round trips a value through browser storage', () => {
    addToLocalStorage({ key: 'test-app', value: 'saved' });
    expect(getDataFromLocalStorage('test-app')).toBe('saved');
    expect(getDataFromLocalStorage('missing')).toBeNull();
  });

  it.each([
    [false, false, true, 'YYYY-MM-DD'],
    [true, false, true, 'YYYY-MM-DD LT'],
    [true, true, true, 'YYYY-MM-DD HH:mm'],
    [true, true, false, 'HH:mm'],
    [true, false, false, 'LT'],
  ])('formats dates and time for flags %s/%s/%s', (time, twentyFourHour, date, expected) => {
    expect(getDateTimeFormat('YYYY-MM-DD', time, twentyFourHour, date)).toBe(expected);
  });

  it.each([
    ['#123', ['17', '34', '51', '1']],
    ['#1238', ['17', '34', '51', '0.53']],
    ['#112233', ['17', '34', '51', '1']],
    ['#11223380', ['17', '34', '51', '0.5']],
  ])('preserves color channels and alpha for %s', (hex, expected) => {
    expect(getRGBAValueFromHex(hex)).toEqual(expected);
  });

  it('produces alpha-free and alpha-bearing CSS colors', () => {
    expect(hexToRgb('#112233')).toBe('rgba(17, 34, 51)');
    expect(hexToRgba('#11223380')).toBe('rgba(17, 34, 51, 0.5)');
  });

  it('converts nested keys without changing scalar values', () => {
    expect(deepCamelCase({ query_data: [{ row_name: 'value', null_value: null }], page_index: 0 })).toEqual({
      queryData: [{ rowName: 'value', nullValue: null }],
      pageIndex: 0,
    });
  });

  it('removes functions from nested state while preserving serializable values', () => {
    const state = { value: 0, callback: () => {}, nested: { label: 'kept', callback: () => {}, empty: null } };
    expect(removeFunctionObjects(state)).toBe(state);
    expect(state).toEqual({ value: 0, nested: { label: 'kept', empty: null } });
  });

  it.each([false, null, undefined, '', NaN])('rejects false-like value %s', (value) => {
    expect(isTruthyOrZero(value)).toBe(false);
  });

  it.each([0, 'value', true])('accepts a present value including zero: %s', (value) => {
    expect(isTruthyOrZero(value)).toBe(true);
  });
});
