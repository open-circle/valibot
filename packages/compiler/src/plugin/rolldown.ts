import type { UnpluginInstance } from 'unplugin';
import { unplugin } from './index.ts';

const rolldown: UnpluginInstance<object | undefined>['rolldown'] =
  unplugin.rolldown;
export default rolldown;
