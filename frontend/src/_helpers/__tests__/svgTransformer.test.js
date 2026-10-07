import transformedSvg from '../../../assets/images/tooljetdb.svg';
import styles from '../../_ui/Icon/Icon.scss';

describe('SVG imports in Jest', () => {
  it('loads an SVG through the configured transformer', () => {
    expect(transformedSvg).toEqual({});
  });

  it('loads stylesheet imports without executing Sass as JavaScript', () => {
    expect(styles).toEqual({});
  });
});
