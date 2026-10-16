import type { UnpluginInstance } from 'unplugin';
import { unplugin } from './index.ts';

const vite: UnpluginInstance<object | undefined>['vite'] = unplugin.vite;
export default vite;
