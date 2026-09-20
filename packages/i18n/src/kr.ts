import ko from './ko.ts';
import type { Language } from './types.ts';

/**
 * @deprecated Use 'ko.ts' instead. The correct ISO 639-1 code for Korean is 'ko'.
 * This alias will be removed in a future major release.
 */

const language: Language = { ...ko, code: 'kr' };

export default language;
