import { Checkbox } from "./ui/checkbox";

interface CheckboxButtonParams {
    label: string
    checked: boolean
    onValueChanged: (value: boolean) => void
}

export default function CheckboxButton({label, checked, onValueChanged}: CheckboxButtonParams){
    return <div className="px-1 py-2 bg-blue flex">
        <Checkbox checked={checked} onChange={console.log}></Checkbox>
        <span>{label}</span>
    </div>
}