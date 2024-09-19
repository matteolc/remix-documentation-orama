import { setTimeout as promiseTimeout } from "node:timers/promises";

const fetchBlogData = async (slug: string): Promise<{ title: string; content: string; slug: string; date: Date }> => {
    return await promiseTimeout(2000, {
        title: "Sample Blog Title",
        content: "This is the content of the sample blog post.",
        date: new Date(),
        slug,
    });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchComments = async (_slug: string): Promise<string[]> => {
    return await promiseTimeout(6000, [
        "Great post!",
        "Very informative.",
        "Thanks for sharing!"
    ]);
};

export { fetchBlogData, fetchComments };
