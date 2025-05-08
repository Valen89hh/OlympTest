import { twMerge } from "tailwind-merge";


interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>{
    className?: string;
}

const Container: React.FC<ContainerProps> = ({
    className,
    children,
    ...props
}) => {
    return ( 
        <div 
            className={twMerge(
                "container mx-auto px-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
 
export default Container;