export const CommentsSkeleton: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
    );
};
