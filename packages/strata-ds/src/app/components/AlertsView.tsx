import { Check, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function AlertsView() {
  const desktopAlertReact = `import { Megaphone } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function BannerAlert() {
  return (
    <Alert className="border-none bg-indigo-600 text-white rounded-none">
      <Megaphone className="h-4 w-4 text-white" />
      <div className="flex items-center gap-4">
        <AlertTitle className="text-white">New version available!</AlertTitle>
        <AlertDescription className="text-indigo-100">
          We just released Strata v1.2. Check out the changelog.
        </AlertDescription>
      </div>
    </Alert>
  )
}`;

  const variantReact = `<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes saved.</AlertDescription>
</Alert>`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Alerts
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Displays a callout for user attention or critical system messages.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Semantic Variants
        </h2>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 space-y-4 mb-6">
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your changes have been saved successfully.</AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>There was a problem processing your request.</AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>Your subscription will expire in 3 days.</AlertDescription>
          </Alert>
        </div>

        <CodeViewer
          title="Alert Variants"
          react={variantReact}
          html={`<!-- Alert HTML -->`}
          css={`.alert { padding: 1rem; }`}
          prompt="Generate semantic alerts."
        />
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Desktop Banner
        </h2>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
          <Alert className="border-none bg-indigo-600 dark:bg-indigo-700 text-white rounded-none py-4">
            <Info className="h-4 w-4 text-white" />
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <AlertTitle className="text-white mb-0">New version available!</AlertTitle>
              <AlertDescription className="text-indigo-100 text-sm">
                We just released Strata v1.2 with new dashboard components.
              </AlertDescription>
            </div>
          </Alert>
        </div>

        <CodeViewer
          title="Banner Alert"
          react={desktopAlertReact}
          html={`<!-- Banner HTML -->`}
          css={`.banner { width: 100%; }`}
          prompt="Generate a banner alert."
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use icons that match the semantic meaning.</li>
            <li>• Keep descriptions brief.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}