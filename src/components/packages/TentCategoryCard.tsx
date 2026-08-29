import React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import LazyImage from "@/components/ui/LazyImage"
import { Check } from "lucide-react"

export interface TentCategoryProps {
  title: string
  description: string
  image: string
  price: string
  tag: string
  badgeVariant?: "luxury" | "luxuryOutline" | "luxuryNavy"
  features: string[]
  onSelect?: () => void
}

export function TentCategoryCard({
  title,
  description,
  image,
  price,
  tag,
  badgeVariant = "luxury",
  features,
  onSelect,
}: TentCategoryProps) {
  return (
    <Card variant="luxury" className="h-full flex flex-col overflow-hidden bg-card text-card-foreground">
      <div className="relative aspect-[16/10] overflow-hidden">
        <LazyImage src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4">
          <Badge variant={badgeVariant}>{tag}</Badge>
        </div>
      </div>
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xl font-display text-primary dark:text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-grow flex flex-col justify-between space-y-4">
        <p className="text-xs text-muted-foreground font-light leading-relaxed">
          {description}
        </p>
        <ul className="space-y-1.5 pt-2 border-t border-border/50">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground font-light">
              <Check className="h-3 w-3 text-[#C9A25A] flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 border-t border-border/40 flex justify-between items-center mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-light uppercase">Starting from</span>
          <span className="text-base font-bold text-primary dark:text-foreground">{price}</span>
        </div>
        <Button variant="luxuryOutline" size="sm" className="h-9 text-xs" onClick={onSelect}>
          Inquire Now
        </Button>
      </CardFooter>
    </Card>
  )
}
export default TentCategoryCard
