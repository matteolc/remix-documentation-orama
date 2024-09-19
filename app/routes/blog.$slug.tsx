import { LoaderFunctionArgs } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { BlogComments } from "~/components/blog/BlogComments";
import { BlogContent } from "~/components/blog/BlogContent";
import { CommentsSkeleton } from "~/components/blog/CommentsSkeleton";
import { Header } from "~/components/blog/Header";
import { fetchBlogData, fetchComments } from "~/services/blog.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;

  if (!slug) {
    return { status: 404 };
  }

  const comments = fetchComments(slug);
  const blogData = await fetchBlogData(slug);

  return {
    content: blogData.content, // <- string
    published: blogData.date, // <- Date
    comments, // <- Promise
  };
};

export default function BlogPost() {
  const blogData = useLoaderData<typeof loader>();

  return (
    <div>
      <Header published={blogData.published} />
      <BlogContent content={blogData.content} />
      <Suspense fallback={<CommentsSkeleton />}>
        <Await resolve={blogData.comments}>
          {(comments) => <BlogComments comments={comments} />}
        </Await>
      </Suspense>
    </div>
  );
}
