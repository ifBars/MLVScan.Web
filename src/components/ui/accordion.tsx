import * as React from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
    activeItem: string | null;
    toggleItem: (value: string) => void;
} | null>(null)

const AccordionItemContext = React.createContext<string | null>(null)

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple"; collapsible?: boolean }
>(({ className, type: _type = "single", collapsible: _collapsible = true, ...props }, ref) => {
    const [activeItem, setActiveItem] = React.useState<string | null>(null)

    const toggleItem = (value: string) => {
        setActiveItem((prev) => (prev === value ? null : value))
    }

    return (
        <AccordionContext.Provider value={{ activeItem, toggleItem }}>
            <div ref={ref} className={className} {...props} />
        </AccordionContext.Provider>
    )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    return (
        <AccordionItemContext.Provider value={value}>
            <div ref={ref} className={cn("border-b", className)} {...props} />
        </AccordionItemContext.Provider>
    )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const value = React.useContext(AccordionItemContext)

    if (!context || !value) return null

    const { activeItem, toggleItem } = context
    const isOpen = activeItem === value

    return (
        <div className="flex">
            <button
                ref={ref}
                onClick={() => toggleItem(value)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={isOpen ? "open" : "closed"}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const value = React.useContext(AccordionItemContext)

    if (!context || !value) return null

    const { activeItem } = context
    const isOpen = activeItem === value

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div ref={ref} className={cn("pb-4 pt-0", className)} {...props}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
