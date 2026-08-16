import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://valibot.dev';

/**
 * Escapes XML special characters of text nodes and attribute values.
 *
 * @param text The text to escape.
 *
 * @returns The escaped text.
 */
function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Read frontmatter of every blog post and sort posts by date
const postsDirPath = path.join('src', 'routes', 'blog', '(posts)');
const posts = fs
  .readdirSync(postsDirPath)
  .map((dirName) => ({
    name: dirName,
    path: path.join(postsDirPath, dirName, 'index.mdx'),
  }))
  .filter((post) => fs.existsSync(post.path))
  .map((post) => {
    const { data } = graymatter.read(post.path);
    const published = new Date(data.published);
    // The feed is consumed by external readers, so fail the build on
    // incomplete frontmatter instead of emitting invalid entries. Atom
    // requires at least one author and a valid date for every entry.
    if (
      !data.title ||
      !data.description ||
      Number.isNaN(published.getTime()) ||
      !Array.isArray(data.authors) ||
      data.authors.length === 0 ||
      data.authors.some((author) => typeof author !== 'string')
    ) {
      throw new Error(
        `Missing or invalid frontmatter in blog post: ${post.path}`
      );
    }
    return {
      name: post.name,
      title: data.title as string,
      description: data.description as string,
      published,
      authors: data.authors as string[],
    };
  })
  .sort(
    (post1, post2) => post2.published.getTime() - post1.published.getTime()
  );

// The feed date is derived from the newest post, so at least one is required
if (posts.length === 0) {
  throw new Error('No blog posts found');
}

// Create an Atom entry for each blog post
const entries = posts
  .map((post) => {
    const url = `${ORIGIN}/blog/${post.name}/`;
    const date = post.published.toISOString();
    return (
      `<entry>` +
      `<title>${escapeXml(post.title)}</title>` +
      `<link rel="alternate" type="text/html" href="${url}"/>` +
      `<link rel="enclosure" type="image/png" href="${ORIGIN}/og/blog_${post.name}.png"/>` +
      `<id>${url}</id>` +
      `<published>${date}</published>` +
      `<updated>${date}</updated>` +
      post.authors
        .map(
          (author) =>
            `<author><name>${escapeXml(author)}</name><uri>https://github.com/${escapeXml(author)}</uri></author>`
        )
        .join('') +
      `<summary>${escapeXml(post.description)}</summary>` +
      `</entry>`
    );
  })
  .join('');

// Write feed.xml to public directory. The feed date is the newest post's
// date instead of the build time to keep the output deterministic.
fs.writeFileSync(
  path.join('public', 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>` +
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">` +
    `<title>Valibot Blog</title>` +
    `<subtitle>Official announcements, project updates and insightful content directly from the Valibot core team.</subtitle>` +
    `<link rel="self" type="application/atom+xml" href="${ORIGIN}/feed.xml"/>` +
    `<link rel="alternate" type="text/html" href="${ORIGIN}/blog/"/>` +
    `<id>${ORIGIN}/blog/</id>` +
    `<updated>${posts[0].published.toISOString()}</updated>` +
    `<icon>${ORIGIN}/icon-32px.png</icon>` +
    entries +
    `</feed>`
);
