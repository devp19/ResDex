"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

export function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className="bg-transparent shadow-none border-none">
        <AccordionTrigger className="bg-transparent shadow-none border-none rounded-none px-0 py-4 font-[Neue] text-base text-black dark:text-white" style={{ fontFamily: 'Neue, sans-serif', fontWeight: 500 }}>
          Product Information
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance bg-transparent shadow-none border-none px-0 text-sm text-black dark:text-white font-[Neue]" style={{ fontFamily: 'Neue, sans-serif' }}>
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers unparalleled
            performance and reliability.
          </p>
          <p>
            Key features include advanced processing capabilities, and an
            intuitive user interface designed for both beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
      <AccordionItem value="item-2" className="bg-transparent shadow-none border-none">
        <AccordionTrigger className="bg-transparent shadow-none border-none rounded-none px-0 py-4 font-[Neue] text-base text-black dark:text-white" style={{ fontFamily: 'Neue, sans-serif', fontWeight: 500 }}>
          Shipping Details
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance bg-transparent shadow-none border-none px-0 text-sm text-black dark:text-white font-[Neue]" style={{ fontFamily: 'Neue, sans-serif' }}>
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
      <AccordionItem value="item-3" className="bg-transparent shadow-none border-none">
        <AccordionTrigger className="bg-transparent shadow-none border-none rounded-none px-0 py-4 font-[Neue] text-base text-black dark:text-white" style={{ fontFamily: 'Neue, sans-serif', fontWeight: 500 }}>
          Return Policy
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance bg-transparent shadow-none border-none px-0 text-sm text-black dark:text-white font-[Neue]" style={{ fontFamily: 'Neue, sans-serif' }}>
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
