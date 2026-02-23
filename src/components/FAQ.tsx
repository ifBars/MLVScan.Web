import { Link } from "react-router-dom"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ = () => {
    return (
        <section className="pt-12 pb-24 px-4 bg-background">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
                        <AccordionTrigger className="hover:no-underline hover:text-teal-300 text-left text-lg">
                            Does MLVScan upload my mods?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                            The <strong>web scanner</strong> runs entirely in your browser—your files never leave your computer. The <strong>runtime plugin</strong> (MelonLoader/BepInEx) can optionally send reports to help fix false positives, but this is <strong>off by default</strong> and requires your explicit consent. See our <Link to="/docs/automated-reporting-data-handling" className="text-teal-400 hover:underline">Automated Reporting</Link> docs.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
                        <AccordionTrigger className="hover:no-underline hover:text-teal-300 text-left text-lg">
                            Does it auto-delete files?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                            Never. We flag suspicious behavior and explain <em>why</em> it's risky. You choose whether to delete or keep the file.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
                        <AccordionTrigger className="hover:no-underline hover:text-teal-300 text-left text-lg">
                            Is it compatible with Vortex/ModOrganizer?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                            Yes. You can scan your entire mod folder (staging folder) regardless of which manager you use.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
                        <AccordionTrigger className="hover:no-underline hover:text-teal-300 text-left text-lg">
                            What if I find a false positive?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                            Report it on our GitHub Issues page, or enable the optional report upload in the runtime plugin to send reports to the API—this helps us improve detection rules. We update rules regularly to reduce false positives.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}

export default FAQ
