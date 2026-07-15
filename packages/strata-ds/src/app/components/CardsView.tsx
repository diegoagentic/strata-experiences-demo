import { CopyButton } from './CopyButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './ui/card';
import { Button } from './ui/button';
import { CodeViewer } from './CodeViewer';
import { ProjectCardsDemo } from './demos/ProjectCardsDemo';
import { OrderCardDemo } from './demos/OrderCardDemo';
import { TransactionCardDemo } from './demos/TransactionCardDemo';
import { TailwindCardsDemo } from './demos/TailwindCardsDemo';
import { BrandedCardDemo } from './demos/BrandedCardDemo';

export function CardsView() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Cards
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-4xl">
          Versatile layout containers for grouping code, data, and content.
        </p>
      </div>

      {/* Default & Branded Cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Basic & Branded Cards
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Standard card styles with and without branding.
          </p>
        </div>

        <div className="p-12 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-8 items-start">
          {/* Default Card */}
          <Card className="max-w-[350px] w-full">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>View and manage project settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This project is currently active and visible to all team members.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Settings</Button>
            </CardFooter>
          </Card>

          {/* Branded Card */}
          <BrandedCardDemo />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CodeViewer
            react={`<Card className="max-w-[350px]">
  <CardHeader>
    <CardTitle>Project Details</CardTitle>
    <CardDescription>View and manage project settings</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      This project is currently active and visible to all team members.
    </p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" className="w-full">View Settings</Button>
  </CardFooter>
</Card>`}
            html=""
            css=""
            prompt="Create a default card."
          />
          <CodeViewer
            react={`<Card className="max-w-[350px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-brand-400/30 shadow-sm relative overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-1 bg-brand-400" />
  <CardHeader>
    <div className="flex items-center gap-2 mb-2">
      <div className="p-2 bg-brand-50 dark:bg-brand-400/10 rounded-lg text-brand-700 dark:text-brand-400">
        <StarIcon className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
        Premium Plan
      </span>
    </div>
    <CardTitle className="text-zinc-900 dark:text-white">Professional</CardTitle>
    <CardDescription className="text-zinc-500 dark:text-zinc-400">
      Advanced features for growing teams.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-zinc-900 dark:text-white">$29</span>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">/month</span>
    </div>
    <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
      Includes priority support, audit logs, and advanced analytics.
    </p>
  </CardContent>
  <CardFooter>
    <Button className="w-full bg-brand-300 hover:bg-brand-400 text-zinc-900 border-transparent shadow-sm font-semibold">
      Upgrade Now
    </Button>
  </CardFooter>
</Card>`}
            html=""
            css=""
            prompt="Create a branded pricing card."
          />
        </div>
      </section>

      {/* Data & Lists Cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Data Lists & Orders
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Common business patterns for displaying transactional data.
          </p>
        </div>

        <div className="p-12 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-8 items-start">
          {/* Order Card */}
          <OrderCardDemo />

          {/* Transaction Card */}
          <TransactionCardDemo />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CodeViewer
            react={`<Card className="w-full max-w-md mx-auto">
  <CardHeader className="border-b border-zinc-950/5 dark:border-white/5 pb-4">
    <div className="flex justify-between items-center">
      <div>
        <CardTitle className="text-base">Order #2034</CardTitle>
        <CardDescription>Placed on Jan 24, 2026</CardDescription>
      </div>
      <div className="text-right">
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
          Shipped
        </span>
      </div>
    </div>
  </CardHeader>
  <CardContent className="pt-6">
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">Items (3)</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">$240.00</span>
      </div>
      {/* ... more items ... */}
      <div className="pt-4 border-t border-zinc-950/5 dark:border-white/5 flex justify-between text-base font-semibold">
        <span className="text-zinc-900 dark:text-zinc-50">Total</span>
        <span className="text-zinc-900 dark:text-zinc-50">$272.16</span>
      </div>
    </div>
  </CardContent>
  {/* Footer */}
</Card>`}
            html=""
            css=""
            prompt="Create an order summary card."
          />
          <CodeViewer
            react={`<Card>
    <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
    </CardHeader>
    <CardContent>
        <ul className="divide-y divide-zinc-100 dark:divide-white/10">
            {transactions.map((transaction) => (
                <li key={transaction.id} className="flex gap-x-4 py-4">
                    {/* Icon & Details */}
                </li>
            ))}
        </ul>
    </CardContent>
</Card>`}
            html=""
            css=""
            prompt="Create a transaction list card."
          />
        </div>
      </section>

      {/* Layout Variants (Tailwind UI Inspired) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Layout Variants
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Alternative card layouts for content marketing and user profiles (Inspired by Tailwind UI).
          </p>
        </div>

        <div className="p-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <TailwindCardsDemo />
        </div>
      </section>

      {/* Flat & Glass Cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Other Variants
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Flat cards for lower prominence and Glass cards for overlays.
          </p>
        </div>

        <div className="p-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-8 items-start relative overflow-hidden">
          {/* Background used for Glass effect demo */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />

          <Card variant="flat" className="max-w-[350px] relative z-10">
            <CardHeader>
              <CardTitle>Flat Card</CardTitle>
              <CardDescription>No shadow, subtle border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Useful for grid layouts or dashboard widgets where high contrast isn't needed.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="max-w-[350px] relative z-10">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Blur effect with transparency</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Perfect for floating panels or content over rich backgrounds.
              </p>
            </CardContent>
          </Card>
        </div>

        <CodeViewer
          react={`{/* Flat Card */}
<Card variant="flat" className="max-w-[350px]">
  <CardHeader>
    <CardTitle>Flat Card</CardTitle>
    <CardDescription>No shadow, subtle border</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Useful for grid layouts or dashboard widgets where high contrast isn't needed.
    </p>
  </CardContent>
</Card>

{/* Glass Card */}
<Card variant="glass" className="max-w-[350px]">
  <CardHeader>
    <CardTitle>Glass Card</CardTitle>
    <CardDescription>Blur effect with transparency</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Perfect for floating panels or content over rich backgrounds.
    </p>
  </CardContent>
</Card>`}
          html=""
          css=""
          prompt="Generate flat and glass card variants."
        />
      </section>


      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12 pb-20">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application (e.g., Dashboard KPI Cards).
        </p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectCardsDemo />
        </div>
      </section>
    </div >
  );
}
