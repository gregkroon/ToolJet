// Query extraction uses the real AST and expression resolver. Only the legacy
// helper import is isolated from its unrelated application-service dependencies.
jest.mock('@/_helpers/utils', () => ({
  getDynamicVariables: jest.requireActual('@/AppBuilder/_stores/utils').getDynamicVariables,
  resolveReferences: jest.requireActual('@/AppBuilder/_stores/utils').resolveDynamicValues,
}));

import { getQueryVariables } from '../queryPanel';

const mappings = { components: {}, queries: {} };

describe('query variable extraction at its current module', () => {
  it.each([[], 'options type is string', { key: 'value' }, null])('returns no variables for %p', (options) => {
    expect(getQueryVariables(options, {}, mappings)).toEqual({});
  });

  it('resolves a multi-line expression using the real expression resolver', () => {
    const options = '{{1 == 1 ?\n"select * from users;" : "select user from users"}}';
    expect(getQueryVariables(options, {}, mappings)).toEqual({
      '{{1 == 1 ? "select * from users;" : "select user from users"}}': 'select * from users;',
    });
  });

  it('resolves a component value with nullish fallback', () => {
    const options = '{{components.dropdown1.value ??\n1}}';
    expect(getQueryVariables(options, { components: { dropdown1: { value: 2 } } }, mappings)).toEqual({
      '{{components.dropdown1.value ?? 1}}': 2,
    });
  });

  it('extracts variables from nested arrays and objects', () => {
    expect(
      getQueryVariables(
        { nested: ['{{parameters.limit}}', { offset: '{{parameters.offset}}' }] },
        { parameters: { limit: 20, offset: 0 } },
        mappings
      )
    ).toEqual({
      '{{parameters.limit}}': 20,
      '{{parameters.offset}}': 0,
    });
  });
});
