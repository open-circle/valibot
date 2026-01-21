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
    signal: undefined,
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

  test('should delete global config', () => {
    deleteGlobalConfig();
    expect(getGlobalConfig()).toStrictEqual(initialConfig);
  });
});
