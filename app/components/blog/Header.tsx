interface HeaderProps {
    published: Date | undefined;
}

const Header: React.FC<HeaderProps> = ({ published }: HeaderProps) => {
    return (
        <header>
            <h1>{published?.toISOString()}</h1>
        </header>
    );
};

export { Header };
