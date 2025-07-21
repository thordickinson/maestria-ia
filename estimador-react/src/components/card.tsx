import type { PropsWithChildren } from "react";

type WithClassName = {
    className?: string
}

type CardProps = {
    title: string;
    subtitle?: string;
    footer?: React.ReactNode;
} & WithClassName;

export default function Card({children, className, title, subtitle, footer}: PropsWithChildren<CardProps>){
    return <div className={`flex flex-col bg-white py-6 rounded-lg shadow-sm 
        transition-shadow duration-300 ease-out hover:shadow-xl hover:bg-gray-50 border border-gray-200
        ${className}`}>
        <div className="flex flex-col px-5 pb-5 border-b-1">
            <div className="text-md font-bold">{title}</div>
            {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
        <div className="flex-1 px-5 pt-6">
        {children}
        </div>
        {footer && <div className="px-5 py-6 border-t-1"> {footer} </div>}
    </div>
}

export function CardFooter({children,className}: PropsWithChildren<WithClassName>){
    return <div className={`px-5 py-6 border-t-1 ${className}`}>
        {children}
    </div>
}