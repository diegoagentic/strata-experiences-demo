import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { CodeViewer } from './CodeViewer';

export function DataTablesView() {
  const tableData = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
  ];

  const basicTableReact = `import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}`;

  const basicTableHTML = `<!-- Table Component -->
<div class="relative w-full overflow-x-auto">
  <table class="w-full text-left text-sm [&_td]:py-4 [&_th]:py-4">
    <thead class="text-zinc-500 dark:text-zinc-400 border-b border-zinc-950/10 dark:border-white/10">
      <tr>
        <th class="px-4 font-medium">Invoice</th>
        <th class="px-4 font-medium text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-zinc-950/5 dark:border-white/5 last:border-none hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]">
        <td class="px-4 text-zinc-950 dark:text-white">INV001</td>
        <td class="px-4 text-zinc-950 dark:text-white text-right">$250.00</td>
      </tr>
    </tbody>
  </table>
</div>`;

  const stripedTableReact = `<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Rows will have alternating background colors */}
    <TableRow>...</TableRow>
  </TableBody>
</Table>`;

  const denseTableReact = `<Table dense>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Cells will have reduced vertical padding */}
    <TableRow>...</TableRow>
  </TableBody>
</Table>`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-950 dark:text-white mb-4">
          Tables
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Clean, high-density tables for data-heavy interfaces.
        </p>
      </div>

      {/* Basic Table */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-6">
          Basic Table
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium text-zinc-950 dark:text-white">{invoice.invoice}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <CodeViewer
          title="Basic Table"
          react={basicTableReact}
          html={basicTableHTML}
          css=".table { width: 100%; text-align: left; font-size: 0.875rem; }"
          prompt="Generate a clean React table using standardized Table components with Zinc primitives."
        />
      </section>

      {/* Striped Table */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-6">
          Striped Table
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-6">
            <Table striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium text-zinc-950 dark:text-white">{invoice.invoice}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <CodeViewer
          title="Striped Table"
          react={stripedTableReact}
          html="<!-- Table with Striped Rows -->"
          css=".striped-row:nth-child(even) { background: var(--zinc-50); }"
          prompt="Add striped rows to the table using the striped prop."
        />
      </section>

      {/* Dense Table */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-6">
          Dense Table
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-6">
            <Table dense>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium text-zinc-950 dark:text-white">{invoice.invoice}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <CodeViewer
          title="Dense Table"
          react={denseTableReact}
          html="<!-- Table with Reduced Padding -->"
          css=".dense-cell { padding: 0.5rem; }"
          prompt="Generate a high-density table using the dense prop."
        />
      </section>

      {/* Usage Guidelines */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-6">
          Usage Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">When to use</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>Displaying tabular data like invoices, users, or logs.</li>
              <li>When users need to compare values across rows.</li>
              <li>Use <strong>dense</strong> for large datasets to reduce scrolling.</li>
              <li>Use <strong>striped</strong> to help eyes track data across wide tables.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Best practices</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>Keep column headers concise and descriptive.</li>
              <li>Right-align numerical data for better scannability.</li>
              <li>Avoid over-nesting components within cells.</li>
              <li>Maintain consistent cell alignment across the table.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
