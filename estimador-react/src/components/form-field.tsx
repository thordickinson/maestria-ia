import type { PropsWithChildren } from "react";

interface FormFieldProps {
    label: string
    editorId?: string
    hint?: string
}

export default function FormField({children, label, editorId, hint}: PropsWithChildren<FormFieldProps>){
    return <div className="flex flex-col">
        <label htmlFor={editorId} className="text-xs">{label}</label>
        <div className="pt-1">
            {children}
        </div>
        <div className="text-xs h-[1em] mb-1">
            {hint}
        </div>
    </div>
}