import type { PropsWithChildren } from "react";

type WithClassName = {
    className?: string
}

export default function Card({children, className}: PropsWithChildren<WithClassName>){
    return <div className={`flex flex-col bg-white rounded-lg shadow-lg ${className}`}>
        {children}
    </div>
}

export function CardHeader({children, className}: PropsWithChildren<WithClassName>){
    return <div className={`px-5 py-7 border-b-1 ${className}`}>
        {children}
    </div>
}

export function CardTitle({children, className}: PropsWithChildren<WithClassName>){
    return <div className={`text-xl font-bold ${className}`}>
        {children}
    </div>
}

export function CardDescription({children, className}: PropsWithChildren<WithClassName>){
    return <div className={`text-sm ${className}`}>
        {children}
    </div>
}

export function CardContent({children, className}: PropsWithChildren<WithClassName>){
    return <div className={`px-6 flex-1 ${className}`}>
        {children}
    </div>
}

export function CardFooter({children,className}: PropsWithChildren<WithClassName>){
    return <div className={`px-5 py-6 border-t-1 ${className}`}>
        {children}
    </div>
}