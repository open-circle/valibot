import type { UnpluginInstance } from 'unplugin';
import { unplugin } from './index.ts';

const rollup: UnpluginInstance<object | undefined>['rollup'] = unplugin.rollup;
export default rollup;
