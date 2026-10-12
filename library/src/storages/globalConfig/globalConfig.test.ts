import { describe, expect, test } from 'vitest';
import type { Config } from '../../types/index.ts';
import {
  deleteGlobalConfig,
  getGlobalConfig,
  type GlobalConfig,
  setGlobalConfig,
} from './globalConfig.ts';

describe('config', () => {
  const initialConfig: Config<never> = {
    lang: undefined,
    message: undefined,
    abortEarly: undefined,
    abortPipeEarly: undefined,
  };

  const customConfig: GlobalConfig = {
    lang: 'en',
    abortEarly: true,
    abortPipeEarly: false,
  };

  test('should be undefined initially', () => {
    expect(getGlobalConfig()).toStrictEqual(initialConfig);
  });

  test('should set and get global config', () => {
    setGlobalConfig(customConfig);
    expect(getGlobalConfig()).toStrictEqual({
      ...initialConfig,
      ...customConfig,
    });
  });

  test('should merge config argument', () => {
    expect(getGlobalConfig({ lang: 'de' })).toStrictEqual({
      ...initialConfig,
      ...customConfig,
      lang: 'de',
    });
  });

  test('should set and resolve lang function', () => {
    setGlobalConfig({ lang: () => 'fr' });
    expect(getGlobalConfig().lang).toBe('fr');
  });

  test('should call lang function each time', () => {
    let count = 0;
    setGlobalConfig({ lang: () => `lang-${++count}` });
    expect(getGlobalConfig().lang).toBe('lang-1');
    expect(getGlobalConfig().lang).toBe('lang-2');
    expect(getGlobalConfig().lang).toBe('lang-3');
  });

  test('should allow local lang to override function lang', () => {
    setGlobalConfig({ lang: () => 'de' });
    expect(getGlobalConfig({ lang: 'en' }).lang).toBe('en');
  });

  test('should delete global config', () => {
    deleteGlobalConfig();
    expect(getGlobalConfig()).toStrictEqual(initialConfig);
  });
});
