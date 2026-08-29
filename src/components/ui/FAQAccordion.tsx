import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface FAQAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FAQItem[]
  variant?: "default" | "luxury"
}

export function FAQAccordion({ items, variant = "luxury", className, ...props }: FAQAccordionProps) {
  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)} {...props}>
      <Accordion type="single" collapsible className="space-y-4">
        {items.map((item, idx) => (
          <AccordionItem
            key={item.id || item.question || `faq-${idx}`}
            value={item.id || item.question || `faq-${idx}`}
            className="bg-[#0B1226]/90 border border-[#C9A25A]/25 hover:border-[#C9A25A]/60 rounded-2xl px-6 py-1 transition-all duration-300 shadow-lg"
          >
            <AccordionTrigger className="text-base md:text-lg font-serif font-bold text-white hover:text-[#E5C378] text-left hover:no-underline py-4 [&[data-state=open]]:text-[#E5C378] transition-colors">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm text-slate-300 font-light leading-relaxed pb-5 pt-1">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
