import dotenv from 'dotenv';
import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { fetch } from 'undici';
import { findNestedFiles } from './utils/index';

// Load environment variables
dotenv.config({ path: '.env.local', override: true });

/**
 * NOTE: Please create `.env.local`, and set your own `GITHUB_PERSONAL_ACCESS_TOKEN`.
 * This token is required because of the GitHub API rate limit. https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
 * How to create a personal access token: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token
 */
const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

const EXCLUDED_COMMITS = ['2cc351f6db7798cf60276225abcbacbc1ea491db'];

/**
 * Updates the contributors of the guides and API reference.
 */
async function updateContributors() {
  // Check if GitHub personal access token is available
  if (!GITHUB_PERSONAL_ACCESS_TOKEN) {
    throw new Error('Missing GITHUB_PERSONAL_ACCESS_TOKEN');
  }

  // Find all MDX files of guides and API reference
  const filePaths = findNestedFiles(
    [path.join('src', 'routes', 'guides'), path.join('src', 'routes', 'api')],
    (fileName) => fileName === 'index.mdx'
  );

  // Update contributors of each MDX file
  for (const filePath of filePaths) {
    // Log info to console
    console.log('Update:', filePath);

    // Read frontmatter of MDX file
    const frontmatter = graymatter.read(filePath);

    // Create API URL and add query parameters
    const url = new URL(
      'https://api.github.com/repos/open-circle/valibot/commits'
    );
    url.searchParams.set('since', '2023-07-13T00:00:00.000Z');
    url.searchParams.set('path', `website/${filePath.replace(/\\/g, '/')}`);

    // Fetch commits of file from GitHub
    const response = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      },
    });

    // Continue if GitHub responded with status code 200
    if (response.status === 200) {
      // Get commits from response
      const commits = (await response.json()) as {
        sha: string;
        author: { login: string } | null;
      }[];

      // Create contributors list
      const contributors: { author: string; count: number }[] = [];

      // Count commits of each author
      for (const commit of commits) {
        if (!EXCLUDED_COMMITS.includes(commit.sha) && commit.author) {
          const author = commit.author.login;
          const contributor = contributors.find(
            (contributor) => contributor.author === author
          );
          if (contributor) {
            contributor.count++;
          } else {
            contributors.push({ author, count: 1 });
          }
        }
      }

      // Sort contributors by commit count
      contributors.sort((a, b) =>
        a.count < b.count ? 1 : a.count > b.count ? -1 : 0
      );

      // Add contributors to frontmatter
      frontmatter.data.contributors = [
        ...new Set([
          ...contributors.map((contributor) => contributor.author),
          ...(frontmatter.data.contributors || []),
        ]),
      ];

      // Write changes to MDX file
      fs.writeFileSync(
        filePath,
        graymatter.stringify(frontmatter.content, frontmatter.data)
      );

      // Otherwise, log error to console
    } else {
      console.log(
        'error',
        response.status,
        response.statusText,
        await response.text()
      );
    }
  }
}

// Start update process
updateContributors();
