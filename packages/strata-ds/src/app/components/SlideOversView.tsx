import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "./ui/sheet";
import { Button } from "./ui/button";

import { CodeViewer } from './CodeViewer';
import { ProjectSlideOversDemo } from "./demos/ProjectSlideOversDemo";
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Check, X, PanelRight, PanelLeft, PanelTop, PanelBottom } from 'lucide-react';

export function SlideOversView() {
  const basicSlideOverReact = `import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function SlideOverDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Slide-over</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {/* Content goes here */}
        </div>
      </SheetContent>
    </Sheet>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Slide-overs (Sheets)</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Overlays that slide in from the edge of the screen, used for complex interactions, forms, or secondary content.
        </Text>
      </div>

      {/* Positions */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-6">Positions</Heading>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <PanelRight className="size-4" /> Right
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Right Slide-over</SheetTitle>
                  <SheetDescription>Standard navigation or detail view.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <PanelLeft className="size-4" /> Left
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Left Slide-over</SheetTitle>
                  <SheetDescription>Ideal for mobile navigation drawers.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <PanelTop className="size-4" /> Top
                </Button>
              </SheetTrigger>
              <SheetContent side="top">
                <SheetHeader>
                  <SheetTitle>Top Slide-over</SheetTitle>
                  <SheetDescription>Used for banners or temporary notices.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <PanelBottom className="size-4" /> Bottom
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Bottom Slide-over</SheetTitle>
                  <SheetDescription>Mobile-friendly action sheet pattern.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <CodeViewer
          title="Slide-over Positions"
          react={basicSlideOverReact}
          html={`<div class="fixed inset-y-0 right-0 w-96 transform transition-transform">...</div>`}
          css={`.sheet-content { position: fixed; background: white; shadow: lg; }`}
          prompt="Generate a set of slide-overs coming from different screen edges with correct transition classes."
        />
      </section>

      {/* Usage Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use for tasks that benefit from keeping the background context visible.</li>
            <li>• Ensure the trigger is clearly labeled.</li>
            <li>• Provide an explicit close button and support "Escape" key.</li>
          </ul>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Don'ts</h3>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>• Don't use for simple confirmations (use Dialog/Modal instead).</li>
            <li>• Avoid deep nesting or complex navigation within a slide-over.</li>
          </ul>
        </div>
      </section>


      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12 pb-20">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application (e.g., Context Sidebar).
        </p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectSlideOversDemo />
        </div>
      </section>
    </div >
  );
}
