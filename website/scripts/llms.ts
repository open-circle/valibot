import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

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

// Create llms.txt intro text
const introText =
  '# Valibot\n\nThe modular and type safe schema library for validating structural data.\n';

// Create llms.txt file with content of guides and API menus
const llmsTxt = `${introText}\n${convertMenuToLlms(menuOfGuides)}\n${convertMenuToLlms(menuOfApi)}`;

// Write llms.txt file to public directory
fs.writeFileSync(path.join('public', 'llms.txt'), llmsTxt);

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

// Create object to hold content for specific llms files
const llms: Record<'full' | 'guides' | 'api', string> = {
  full: introText,
  guides: introText,
  api: introText,
};

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

    // Add heading to specific llms files
    llms.full += `\n${heading} (${contentArea.name})\n`;
    llms[contentArea.id] += `\n${heading}\n`;

    // Copy content of MDX files to public dir and add content to llms files
    for (const mdxFile of areaGroup.files) {
      // Read MDX file and extract frontmatter
      const frontmatter = graymatter.read(mdxFile.path);

      // Remove MDX import statements from MDX content
      const mdxContent = frontmatter.content.slice(
        frontmatter.content.indexOf('# ') // Index of first heading
      );

      // Copy MDX content into public directory
      fs.writeFileSync(
        path.join(contentArea.publicDir, `${mdxFile.name}.md`),
        mdxContent
      );

      // Change level of headings two levels down
      const llmsContent = mdxContent.replaceAll(/^#/gm, '###');

      // Add content to specific llms files
      llms.full += `\n${llmsContent}`;
      llms[contentArea.id] += `\n${llmsContent}`;
    }
  }
}

// Write specific llms files to public directory
fs.writeFileSync(path.join('public', 'llms-full.txt'), llms.full);
fs.writeFileSync(path.join('public', 'llms-guides.txt'), llms.guides);
fs.writeFileSync(path.join('public', 'llms-api.txt'), llms.api);
