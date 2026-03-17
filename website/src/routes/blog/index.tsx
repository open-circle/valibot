import { component$ } from '@builder.io/qwik';
import {
  type DocumentHead,
  type DocumentHeadValue,
  routeLoader$,
} from '@builder.io/qwik-city';
import { PostList } from '~/components';

export const head: DocumentHead = {
  title: 'Blog',
  meta: [
    {
      name: 'description',
      content:
        "Official announcements, project updates and insightful content directly from the Valibot core team. We're excited to share our journey with you! Let's validate together!",
    },
  ],
};

type PostFrontmatter = {
  cover: string;
  title: string;
  published: string;
  authors: string[];
};

type PostData = PostFrontmatter & {
  href: string;
};

interface PostSection {
  heading: string;
  posts: PostData[];
}

/**
 * Loads the required data for each blog post.
 */
export const usePosts = routeLoader$(async () => {
  // Dynamically import all blog post metadata from the file system
  const posts: PostData[] = (
    await Promise.all(
      Object.entries(
        import.meta.glob<DocumentHeadValue<PostFrontmatter>>('./**/index.mdx')
      ).map(async ([path, readFile]) => {
        const { frontmatter } = await readFile();
        return {
          cover: frontmatter!.cover,
          title: frontmatter!.title,
          published: frontmatter!.published,
          authors: frontmatter!.authors,
          href: `./${path.split('/').slice(2, 3)[0]}/`,
        };
      })
    )
  ).sort((a, b) => (a.published < b.published ? 1 : -1));

  // Create variables for latest posts and posts by year
  const latestCutoff = new Date(Date.now() - 7776000000); // 3 months
  const latestPosts: PostData[] = [];
  const postsByYear: Record<string, PostData[]> = {};

  // Add posts to latest or by year based on published date
  for (const post of posts) {
    if (new Date(post.published) >= latestCutoff) {
      latestPosts.push(post);
    } else {
      const year = post.published.slice(0, 4);
      if (postsByYear[year]) {
        postsByYear[year].push(post);
      } else {
        postsByYear[year] = [post];
      }
    }
  }

  // Convert posts by year into a post sections array
  const postSections: PostSection[] = Object.entries(postsByYear)
    .sort(([yearA], [yearB]) => (yearA < yearB ? 1 : -1))
    .map(([year, posts]) => ({
      heading: `Posts of ${year}`,
      posts,
    }));

  // Add latest posts section to beginning if there are any
  if (latestPosts.length > 0) {
    postSections.unshift({ heading: 'Latest posts', posts: latestPosts });
  }

  // Return final post sections array
  return postSections;
});

export default component$(() => {
  const posts = usePosts();
  return (
    <main class="flex w-full max-w-(--breakpoint-lg) flex-1 flex-col gap-12 self-center py-12 md:gap-14 md:py-14 lg:gap-16 lg:py-24 xl:py-32">
      <div class="mdx">
        <h1>Blog</h1>
        <p>
          Official announcements, project updates and insightful content
          directly from the Valibot core team. We're excited to share our
          journey with you! Let's validate together!
        </p>
      </div>
      {posts.value.map((section) => (
        <section key={section.heading}>
          <div class="mdx">
            <h2>{section.heading}</h2>
          </div>
          <PostList posts={section.posts} />
        </section>
      ))}
    </main>
  );
});
