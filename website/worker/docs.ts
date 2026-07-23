/**
 * Shared knowledge about our documentation pages and their Markdown mirrors
 * that is used by the Worker and our build scripts.
 */

// Areas of the documentation with a Markdown version for every page
export const DOC_AREAS = ['guides', 'api'] as const;
export type DocArea = (typeof DOC_AREAS)[number];

// Path of documentation pages and their Markdown version. The third group
// captures the ".md" suffix, including the naive "/.md" suffix that agents
// produce by appending ".md" to a page URL that ends with a trailing slash.
export const DOCS_PATH_REGEX = new RegExp(
  `^\\/(${DOC_AREAS.join('|')})\\/([\\w.-]+?)(\\.md|\\/\\.md)?\\/?$`
);

/**
 * An entry of the search index that our build process generates and our MCP
 * server consumes.
 */
export interface SearchEntry {
  area: DocArea;
  group: string;
  name: string;
  title: string;
  description: string;
  excerpt: string;
  headings: string[];
}

/**
 * Creates the URLs of the HTML page and Markdown version of a documentation
 * page.
 *
 * @param origin The origin of the website.
 * @param area The area of the page.
 * @param name The name of the page.
 *
 * @returns The URLs of the page.
 */
export function getDocUrls(origin: string, area: DocArea, name: string) {
  return {
    url: `${origin}/${area}/${name}/`,
    markdownUrl: `${origin}/${area}/${name}.md`,
  };
}
