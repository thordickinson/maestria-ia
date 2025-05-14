import { PropsWithChildren } from "react";
import { Label } from "./label";

interface FormFieldProps {
    label: string
    editorId?: string
    hint?: string
}

export default function FormField({children, label, editorId, hint}: PropsWithChildren<FormFieldProps>){
    return <div className="flex flex-col">
        <Label htmlFor={editorId}>{label}</Label>
        <div className="pt-2">
            {children}
        </div>
        <div className="text-xs h-[1em] mb-1">
            {hint}
        </div>
    </div>
}