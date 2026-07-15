import { CloudUpload, FileText, Check, X } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Badge } from './ui/badge';

export function FileUploadView() {
  const uploadReact = `import { CloudUpload } from 'lucide-react'

export function FileUpload() {
  return (
    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
      <CloudUpload className="mx-auto h-12 w-12 text-zinc-400" />
      <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        <button className="font-semibold text-zinc-950 dark:text-white underline">Upload a file</button>
        <span> or drag and drop</span>
      </div>
      <p className="text-xs text-zinc-500 mt-2">PNG, JPG, PDF up to 10MB</p>
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">File Upload (OCR Pattern)</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Drag and drop upload component for document processing and OCR workflows.
        </Text>
      </div>

      {/* Main Upload Area */}
      <section className="mb-16">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6 text-center">
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-16 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer group">
            <CloudUpload className="mx-auto h-16 w-16 text-zinc-400 group-hover:text-zinc-500 transition-colors" />
            <div className="mt-6 text-sm/6 text-zinc-600 dark:text-zinc-400">
              <button className="font-semibold text-zinc-950 dark:text-white underline">Upload a file</button>
              <span> or drag and drop</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>

        <CodeViewer
          title="File Upload"
          react={uploadReact}
          html={`<div class="border-dashed border-2 p-12">...</div>`}
          css={`.upload-zone { border-style: dashed; }`}
          prompt="Generate a drag and drop file upload zone with a large icon and primary call to action."
        />
      </section >

      {/* Uploaded Files Table-style list */}
      < section className="mb-16" >
        <Heading level={2} className="text-2xl font-bold mb-6">Recent Uploads</Heading>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <li className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded">
                  <FileText className="h-6 w-6 text-zinc-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-950 dark:text-white">invoice_2024_001.pdf</div>
                  <div className="text-xs text-zinc-500">2.4 MB • 5m ago</div>
                </div>
              </div>
              <Badge color="emerald" variant="soft">Complete</Badge>
            </li>
            <li className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded">
                  <FileText className="h-6 w-6 text-zinc-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-950 dark:text-white">receipt_scanner.jpg</div>
                  <div className="text-xs text-zinc-500">1.8 MB • Processing...</div>
                </div>
              </div>
              <Badge color="sky" variant="soft">Processing</Badge>
            </li>
          </ul>
        </div>
      </section >

      {/* Guidelines */}
      < section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20" >
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use clear status indicators for background processing.</li>
            <li>• Provide a visual hint for the drop zone area.</li>
          </ul>
        </div>
      </section >
    </div >
  );
}
