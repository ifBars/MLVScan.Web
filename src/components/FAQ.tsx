
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
                            No. MLVScan runs entirely on your local machine using WebAssembly. Your files never leave your computer.
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
                            Please report it on our GitHub Issues page. We update our detection rules regularly to improve accuracy.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}

export default FAQ
