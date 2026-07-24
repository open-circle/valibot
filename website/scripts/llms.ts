import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PropertyProps } from '~/components';
import type { SearchEntry } from '../worker/docs';
import { serializeProperty, transformTextSegments } from './utils/index';

// Read menu.md of guides and API
const menuOfGuides = fs.readFileSync(
  path.join('src', 'routes', 'guides', 'menu.md'),
  'utf-8'
);
const menuOfApi = fs.readFileSync(
  path.join('src', 'routes', 'api', 'menu.md'),
  'utf-8'
);

/**
 * Converts a markdown menu to a string suitable for our llms.txt file.
 *
 * @param markdown The markdown string to convert.
 *
 * @returns A llms.txt compatible string.
 */
function convertMenuToLlms(markdown: string): string {
  return (
    markdown
      // Change levels of headings to one level down
      .replaceAll(/^#/gm, '##')
      // Replace relative paths with URLs to MD files
      .replaceAll(/\(\/(.+)\/\)$/gm, '(https://valibot.dev/$1.md)')
  );
}

// Create intro text with title and summary for llms files
const introText =
  '# Valibot\n\n> The modular and type safe schema library for validating structural data.\n';

// Create details text with pointers to other resources for llms.txt file
const detailsText =
  'Every link below points to the Markdown version of a documentation page. The same page is served as HTML at the same URL without the `.md` extension. The whole documentation is also available as a single file at [llms-full.txt](https://valibot.dev/llms-full.txt), the guides at [llms-guides.txt](https://valibot.dev/llms-guides.txt), the API reference at [llms-api.txt](https://valibot.dev/llms-api.txt) and the blog posts at [llms-blog.txt](https://valibot.dev/llms-blog.txt). An MCP server with tools to search and read this documentation is available at https://valibot.dev/mcp (see [server card](https://valibot.dev/.well-known/mcp/server-card.json) and [coding agents guide](https://valibot.dev/guides/coding-agents.md)).\n';

/**
 * Extracts grouped file paths from a markdown menu.
 *
 * @param markdown The markdown menu string.
 *
 * @returns A grouped array of file paths.
 */
function extractFilePathsOfMenu(
  markdown: string
): { title: string; files: { name: string; path: string }[] }[] {
  // Split menu into groups based on level 2 headings
  const groups = markdown.split(/^## /gm).slice(1);

  // Convert groups into an array of MDX file paths
  return groups.map((group) => {
    // Extract title and create slug
    const groupTitle = group.match(/(^.+)\n/)![1];
    const groupSlug = groupTitle.toLowerCase().replace(/\s+/g, '-');

    // Create object to hold title and file data
    const groupData: {
      title: string;
      files: { name: string; path: string }[];
    } = { title: groupTitle, files: [] };

    // Extract file paths from group using regex
    const filePaths = group.matchAll(/\(\/(.+)\/(.+)\/\)/gm);

    // Add data of each file path to group data
    for (const regexMatch of filePaths) {
      // Extract area and name from regex match
      const fileArea = regexMatch[1];
      const fileName = regexMatch[2];

      // Create MDX file path based on area, group slug and name
      const filePath = path.join(
        'src',
        'routes',
        fileArea,
        `(${groupSlug})`,
        fileName,
        'index.mdx'
      );

      // Add file data to fiels of group data
      groupData.files.push({
        name: fileName,
        path: filePath,
      });
    }

    // Return final group data
    return groupData;
  });
}

/**
 * Formats the publication date of a blog post the same way as our website.
 *
 * @param published The publication date of the post.
 *
 * @returns A formatted date string.
 */
function formatPublished(published: Date): string {
  return published.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Extracts grouped file paths of our blog posts from the file system. The
 * posts are sorted by publication date and grouped by year, similar to the
 * sections of our blog page.
 *
 * @returns A grouped array of file paths.
 */
function extractFilePathsOfBlog(): {
  title: string;
  files: { name: string; path: string; title: string; published: Date }[];
}[] {
  // Read metadata of every blog post from its frontmatter
  const postsDir = path.join('src', 'routes', 'blog', '(posts)');
  const posts = fs
    .readdirSync(postsDir)
    .map((dirName) => ({
      name: dirName,
      path: path.join(postsDir, dirName, 'index.mdx'),
    }))
    .filter((post) => fs.existsSync(post.path))
    .map((post) => {
      const frontmatter = graymatter.read(post.path);
      return {
        ...post,
        title: frontmatter.data.title as string,
        published: new Date(frontmatter.data.published),
      };
    })
    .sort(
      (post1, post2) => post2.published.getTime() - post1.published.getTime()
    );

  // Group posts by publication year with the latest year first
  const blogGroups: {
    title: string;
    files: { name: string; path: string; title: string; published: Date }[];
  }[] = [];
  for (const post of posts) {
    const groupTitle = `Posts of ${post.published.getUTCFullYear()}`;
    let blogGroup = blogGroups.find((group) => group.title === groupTitle);
    if (!blogGroup) {
      blogGroup = { title: groupTitle, files: [] };
      blogGroups.push(blogGroup);
    }
    blogGroup.files.push(post);
  }
  return blogGroups;
}

// Extract grouped file paths of our blog posts
const groupsOfBlog = extractFilePathsOfBlog();

// Create menu of our blog posts with links to their Markdown version
const menuOfBlog = `## Blog\n${groupsOfBlog
  .map(
    (blogGroup) =>
      `\n### ${blogGroup.title}\n\n${blogGroup.files
        .map(
          (file) =>
            `- [${file.title}](https://valibot.dev/blog/${file.name}.md) (${formatPublished(file.published)})\n`
        )
        .join('')}`
  )
  .join('')}`;

// Create llms.txt file with content of guides, API and blog menus
const llmsTxt = `${introText}\n${detailsText}\n${convertMenuToLlms(menuOfGuides)}\n${convertMenuToLlms(menuOfApi)}\n${menuOfBlog}`;

// Write llms.txt file to public directory
fs.writeFileSync(path.join('public', 'llms.txt'), llmsTxt);

/**
 * Converts the MDX components of our docs to plain Markdown so that the
 * content of the generated MD files matches the rendered HTML output.
 *
 * @param mdxContent The MDX content to convert.
 * @param dirPath The directory path of the MDX file.
 * @param pageUrl The URL of the documentation page.
 *
 * @returns A plain Markdown string.
 */
async function convertMdxToMd(
  mdxContent: string,
  dirPath: string,
  pageUrl: string
): Promise<string> {
  // Import property data if MDX content uses spread Property components
  let properties: Record<string, PropertyProps> = {};
  if (mdxContent.includes('{...properties')) {
    properties = (
      await import(pathToFileURL(path.join(dirPath, 'properties.ts')).href)
    ).properties;
  }

  // Transform text outside of code blocks to plain Markdown
  return transformTextSegments(mdxContent, (segment) =>
    segment
      // Replace spread Property components with serialized type
      .replaceAll(
        /<Property\s+\{\.\.\.properties(?:\.(\w+)|\['([^']+)'\])\}\s*\/>/g,
        (match, dotName: string | undefined, bracketName: string) => {
          const name = dotName ?? bracketName;
          const data = properties[name];
          if (!data) {
            throw new Error(`Missing property "${name}" in ${dirPath}`);
          }
          return serializeProperty(data);
        }
      )

      // Replace literal Property components with inline code
      .replaceAll(/<Property\s+type=["']([^"']+)["']\s*\/>/g, '`$1`')

      // Replace Link components with Markdown links
      .replaceAll(
        /<Link\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Link>/g,
        '[$2]($1)'
      )

      // Replace inline HTML anchor elements with Markdown links
      .replaceAll(
        /<a\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g,
        '[$2]($1)'
      )

      // Replace ApiList components with a list of Markdown links
      .replaceAll(/<ApiList\s+([\s\S]*?)\/>/g, (match, attrs: string) => {
        const label = attrs.match(/label=["']([^"']+)["']/)?.[1];
        const items = [...attrs.matchAll(/'([^']+)'/g)].map(
          (itemMatch) => `[\`${itemMatch[1]}\`](/api/${itemMatch[1]}/)`
        );
        return `${label ? `${label}: ` : ''}${items.join(', ')}`;
      })

      // Resolve relative link paths to absolute link paths so that
      // links work outside the HTML context of the page
      .replaceAll(/\]\((\.\.?\/[^)]+)\)/g, (match, target: string) => {
        const resolvedUrl = new URL(target, pageUrl);
        return `](${resolvedUrl.pathname}${resolvedUrl.hash})`;
      })

      // Rewrite links to documentation pages to their Markdown version
      // so that AI agents stay within the Markdown context
      .replaceAll(
        /\]\(\/(guides|api|blog)\/([\w.-]+?)\/(#[^)]*)?\)/g,
        '](/$1/$2.md$3)'
      )

      // Remove MDX comments (e.g. prettier-ignore) as they only matter for
      // the source code
      .replaceAll(/\{\/\*[\s\S]*?\*\/\}\n?/g, '')

      // Remove raw HTML blocks (e.g. embedded images and logo lists) as
      // they cannot be converted to plain Markdown
      .replaceAll(/^<([a-z]+)[^>\n]*>[\s\S]*?^<\/\1>\n?/gm, '')

      // Remove remaining components (e.g. images and interactive
      // elements) as they cannot be converted to plain Markdown
      .replaceAll(/^<[A-Z][\s\S]*?\/>\n?/gm, '')
  );
}

/**
 * Warns about component markup that our MDX to Markdown conversion did not
 * catch so that new components are noticed and handled.
 *
 * @param mdContent The converted Markdown content.
 * @param filePath The path of the source MDX file.
 */
function warnAboutUnknownComponents(mdContent: string, filePath: string) {
  transformTextSegments(mdContent, (segment) => {
    const componentMatch = segment
      // Remove inline code as it can contain generic type arguments
      .replaceAll(/(`+)[\s\S]*?\1/g, '')
      .match(/<[A-Z]\w*[\s/]/);
    if (componentMatch) {
      console.warn(
        `Unknown component "${componentMatch[0].trim()}" in Markdown output of ${filePath}`
      );
    }
    return segment;
  });
}

// Create object to hold content for specific llms files
const llms: Record<'full' | 'guides' | 'api' | 'blog', string> = {
  full: introText,
  guides: introText,
  api: introText,
  blog: introText,
};

// Create list to hold search index entries for our MCP server
const searchIndex: SearchEntry[] = [];

// Define content areas with all necessary data
const contentAreas = [
  {
    id: 'guides',
    name: 'guides',
    publicDir: path.join('public', 'guides'),
    groups: extractFilePathsOfMenu(menuOfGuides),
  },
  {
    id: 'api',
    name: 'API',
    publicDir: path.join('public', 'api'),
    groups: extractFilePathsOfMenu(menuOfApi),
  },
  {
    id: 'blog',
    name: 'blog',
    publicDir: path.join('public', 'blog'),
    groups: groupsOfBlog,
  },
] as const;

// Copy content of MDX files to public dir and add it to llms files
for (const contentArea of contentAreas) {
  // Ensure directory of content area exists
  if (!fs.existsSync(contentArea.publicDir)) {
    fs.mkdirSync(contentArea.publicDir);
  }

  // Add group title to llms files and process its files
  for (const areaGroup of contentArea.groups) {
    // Create level 2 heading for group
    const heading = `## ${areaGroup.title}`;

    // Add heading to specific llms files. The blog is excluded from the
    // full file, as its posts are dated announcements that may describe
    // previous versions of the API.
    if (contentArea.id !== 'blog') {
      llms.full += `\n${heading} (${contentArea.name})\n`;
    }
    llms[contentArea.id] += `\n${heading}\n`;

    // Copy content of MDX files to public dir and add content to llms files
    for (const mdxFile of areaGroup.files) {
      // Read MDX file and extract frontmatter
      const frontmatter = graymatter.read(mdxFile.path);

      // Remove MDX import statements from MDX content. Documentation pages
      // start with a first-level heading, while blog posts render their
      // title and meta data via the frontmatter, so we recreate both in
      // Markdown the same way as our website.
      let mdxContent: string;
      if (contentArea.id === 'blog') {
        const authors = (frontmatter.data.authors as string[])
          .map((author) => `[${author}](https://github.com/${author})`)
          .join(', ');
        const postContent = frontmatter.content
          .replace(/^\s*(?:import[\s\S]*?from\s+'[^']+';\s*)+/, '')
          .trimStart();
        mdxContent = `# ${frontmatter.data.title}\n\nPublished on ${formatPublished(new Date(frontmatter.data.published))} by ${authors}\n\n${postContent}`;
      } else {
        mdxContent = frontmatter.content.slice(
          frontmatter.content.indexOf('# ') // Index of first heading
        );
      }

      // Create URL of documentation page
      const pageUrl = `https://valibot.dev/${contentArea.id}/${mdxFile.name}/`;

      // Convert MDX components of content to plain Markdown
      const mdContent = await convertMdxToMd(
        mdxContent,
        path.dirname(mdxFile.path),
        pageUrl
      );

      // Warn about component markup that was not converted
      warnAboutUnknownComponents(mdContent, mdxFile.path);

      // Extract headings of MD content outside of code blocks
      const headings: string[] = [];
      transformTextSegments(mdContent, (segment) => {
        for (const regexMatch of segment.matchAll(/^#{2,3} (.+)$/gm)) {
          headings.push(regexMatch[1]);
        }
        return segment;
      });

      // Add entry with metadata of page to search index. The excerpt is the
      // intro paragraph of the page, which follows the heading of
      // documentation pages and the publication meta line of blog posts.
      const paragraphs = mdContent.split('\n\n');
      searchIndex.push({
        area: contentArea.id,
        group: areaGroup.title,
        name: mdxFile.name,
        title: frontmatter.data.title ?? mdxFile.name,
        description: frontmatter.data.description ?? '',
        excerpt:
          paragraphs[contentArea.id === 'blog' ? 2 : 1]?.slice(0, 400) ?? '',
        headings,
      });

      // Create agent directive with pointer to HTML page and llms.txt file
      const directive = `> This document is the Markdown version of [valibot.dev/${contentArea.id}/${mdxFile.name}/](${pageUrl}). For the complete documentation index, see [llms.txt](https://valibot.dev/llms.txt).`;

      // Add agent directive below first heading of MD content
      const headingEnd = mdContent.indexOf('\n');
      const pageContent = `${mdContent.slice(0, headingEnd)}\n\n${directive}${mdContent.slice(headingEnd)}`;

      // Copy MD content with directive into public directory
      fs.writeFileSync(
        path.join(contentArea.publicDir, `${mdxFile.name}.md`),
        pageContent
      );

      // Change level of headings two levels down without touching `#`
      // comments within code blocks
      const llmsContent = transformTextSegments(mdContent, (segment) =>
        segment.replaceAll(/^#/gm, '###')
      );

      // Add content to specific llms files
      if (contentArea.id !== 'blog') {
        llms.full += `\n${llmsContent}`;
      }
      llms[contentArea.id] += `\n${llmsContent}`;
    }
  }
}

// Write specific llms files to public directory
fs.writeFileSync(path.join('public', 'llms-full.txt'), llms.full);
fs.writeFileSync(path.join('public', 'llms-guides.txt'), llms.guides);
fs.writeFileSync(path.join('public', 'llms-api.txt'), llms.api);
fs.writeFileSync(path.join('public', 'llms-blog.txt'), llms.blog);

// Write search index for our MCP server to public directory
fs.writeFileSync(
  path.join('public', 'search-index.json'),
  JSON.stringify(searchIndex)
);
