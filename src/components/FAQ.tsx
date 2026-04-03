import { Link } from "react-router-dom"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { homeFaqs } from "@/content/homeFaq"

const FAQ = () => {
  return (
    <section className="pt-12 pb-24 px-4 bg-background">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
        <p className="text-center text-muted-foreground mb-12">
          Quick answers for people looking for MLVScan, a Unity mod antivirus, local browser scans,
          and safer MelonLoader or BepInEx workflows.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {homeFaqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index + 1}`} className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
              <AccordionTrigger className="hover:no-underline hover:text-teal-300 text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                {faq.answer}
                {index === 1 ? (
                  <>
                    {" "}See our{" "}
                    <Link to="/docs/automated-reporting-data-handling" className="text-teal-400 hover:underline">
                      Automated Reporting
                    </Link>{" "}
                    docs for the full data-handling breakdown.
                  </>
                ) : null}
                {index === 3 ? (
                  <>
                    {" "}You can also start with the{" "}
                    <Link to="/docs/unity-mod-antivirus" className="text-teal-400 hover:underline">
                      Unity mod antivirus guide
                    </Link>
                    .
                  </>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export default FAQ
