interface BlogCommentsProps {
    comments: string[] | undefined;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ comments }: BlogCommentsProps) => {
    if (!comments) {
        return null;
    }

    return (
        <section>
            <h3>Comments</h3>
            {comments.length > 0 ? (
                <ul>
                    {comments.map((comment, index) => (
                        <li key={index}>{comment}</li>
                    ))}
                </ul>
            ) : (
                <p>No comments yet...</p>
            )}
        </section>
    );
};

export { BlogComments };
