import { component$ } from '@builder.io/qwik';
import { Link } from './Link';
import { PostCover } from './PostCover';
import { PostMeta } from './PostMeta';

interface BlogPostData {
  authors: string[];
  cover: string;
  href: string;
  published: string;
  title: string;
}

interface PostListProps {
  posts: BlogPostData[];
}

/**
 * Displays a list of blog post cards.
 */
export const PostList = component$<PostListProps>(({ posts }) => (
  <ol class="mx-3 mt-6 flex flex-wrap lg:mx-2 lg:mt-10">
    {posts.map((post) => (
      <li class="w-full px-5 py-6 md:w-1/2 lg:p-8" key={post.href}>
        <Link class="flex flex-col gap-8" href={post.href} prefetch={false}>
          <PostCover variant="blog" label={post.cover} />
          <div class="flex flex-col gap-5">
            <h3 class="text-lg leading-normal font-medium text-slate-900 md:text-xl lg:text-2xl dark:text-slate-200">
              {post.title}
            </h3>
            <PostMeta
              variant="blog"
              authors={post.authors}
              published={post.published}
            />
          </div>
        </Link>
      </li>
    ))}
  </ol>
));
