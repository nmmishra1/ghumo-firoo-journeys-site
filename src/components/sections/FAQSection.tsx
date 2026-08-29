import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, ChevronDown } from 'lucide-react';

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
  dark = false
}) => {
  if (!faqs || faqs.length === 0) return null;

  const titleColor = dark ? 'text-white' : 'text-gray-900 dark:text-white';
  const subtitleColor = dark ? 'text-slate-400' : 'text-gray-500 dark:text-gray-400';
  const itemClass = dark 
    ? 'bg-white/5 border-white/10 shadow-none' 
    : 'bg-white/40 backdrop-blur-sm border-gray-100/50 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none';
  const triggerColor = dark ? 'text-slate-200' : 'text-gray-700 dark:text-slate-200';
  const contentColor = dark ? 'text-slate-300' : 'text-gray-600 dark:text-slate-300';
  const dividerClass = dark ? 'border-white/10' : 'border-gray-50/50 dark:border-white/10';

  return (
    <section className={`py-12 bg-transparent ${className}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-1.5 bg-accent/5 rounded-full mb-3">
            <HelpCircle className="w-4 h-4 text-accent" />
          </div>
          <h2 className={`text-xl font-bold tracking-tight sm:text-2xl ${titleColor}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`mt-1.5 text-sm max-w-lg mx-auto ${subtitleColor}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className={`group px-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:border-accent/20/50 ${itemClass}`}
              >
                <AccordionTrigger className={`text-left font-semibold hover:text-accent hover:no-underline py-3.5 text-sm sm:text-base transition-colors duration-200 ${triggerColor}`}>
                  <span className="pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className={`leading-relaxed pb-4 text-xs sm:text-sm animate-accordion-down ${contentColor}`}>
                  <div className={`pt-2 border-t ${dividerClass}`}>
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
