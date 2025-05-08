import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement>{
    className?: string;
}

const Card: React.FC<CardProps> = ({
    className,
    children,
    ...props
}) => {
    return ( 
        <section 
            className={twMerge(
                "bg-white p-4 rounded-lg shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </section>
    );
}
 
export default Card;