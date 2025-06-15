import type { PropsWithChildren } from "react";

export default function ButtonPanel({children}: PropsWithChildren){
    return <div className="flex flex-row gap-2">
        {children}
    </div>
}