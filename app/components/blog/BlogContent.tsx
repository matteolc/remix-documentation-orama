interface BlogContentProps {
    content: string | undefined;
}

const BlogContent: React.FC<BlogContentProps> = ({ content }: BlogContentProps) => {
    if (!content) {
        return null;
    }

    return (
        <main>
            <article>
                <h2>Blog Title</h2>
                <p>{content}</p>
            </article>
        </main>
    );
};

export { BlogContent };
