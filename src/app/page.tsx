import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from "@/components/header"
import { ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <section>
          <div className="relative min-h-screen py-24 md:pb-32 lg:pb-36 lg:pt-72">
            <div className="relative mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">Win Smarter. Every Sunday.</h1>
                <p className="mt-8 max-w-2xl text-balance text-lg">Stop guessing, start predicting with next-level AI intelligence.</p>

                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full pl-5 pr-3 text-base">
                    <Link href="#link">
                      <span className="text-nowrap">Get Started</span>
                      <ChevronRight className="ml-1" />
                    </Link>
                  </Button>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5">
                    <Link href="#link">
                      <span className="text-nowrap">Request a demo</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 overflow-hidden border border-black/10 dark:border-white/5">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover opacity-50 invert dark:opacity-35 dark:invert-0 dark:lg:opacity-75"
                src="https://www.pexels.com/download/video/8799171/"></video>
            </div>
          </div>
        </section>
      </main>
      <section>
        <div className="relative mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
          <h2 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl drop-shadow-lg">How it works</h2>
        </div>
      </section>
    </>
  )
}
