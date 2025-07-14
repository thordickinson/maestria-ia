type CardSection = {
    title: string
    subtitle?: string
}

export default function CardSection({title, subtitle}: CardSection){
    return <div className="w-full mb-2">
        <div className="text-lg font-semibold">
        {title}
        </div>
        {subtitle && <div>{subtitle}</div>}
    </div>
} 