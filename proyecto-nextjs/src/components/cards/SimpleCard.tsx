import { JSXElementConstructor, PropsWithChildren, ReactElement, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export type SimpleCardParams = {
  title?: string;
  subtitle?: string;
};

export default function SimpleCard({ children, title, subtitle }: PropsWithChildren<SimpleCardParams>) {
  return (
    <Card className="@container/card">
      { (title || subtitle) && <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {subtitle && <CardDescription> {subtitle}</CardDescription>}
      </CardHeader> }
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">{children}</CardContent>
    </Card>
  );
}
