import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  dark?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({ 
  faqs, 
  title = "Frequently Asked Questions", 
  subtitle = "Find answers to common questions about your journey.",
  className = "",
  dark = true
}) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className={`py-12 bg-transparent ${className}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-[#C9A25A]/15 border border-[#C9A25A]/30 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-[#C9A25A]" />
          </div>
          <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-3xl text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-300 font-light max-w-lg mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-[#0B1226]/90 border border-[#C9A25A]/25 hover:border-[#C9A25A]/60 rounded-2xl px-6 py-1 transition-all duration-300 shadow-lg"
              >
                <AccordionTrigger className="text-base md:text-lg font-serif font-bold text-white hover:text-[#E5C378] text-left hover:no-underline py-4 [&[data-state=open]]:text-[#E5C378] transition-colors">
                  <span className="pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-slate-200 font-light leading-relaxed pb-5 pt-1">
                  <div className="pt-2 border-t border-white/10 text-slate-300">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

