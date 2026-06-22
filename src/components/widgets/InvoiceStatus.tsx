import { DollarSign, Download, CreditCard, AlertTriangle, CheckCircle2, Clock, Receipt, Eye, PiggyBank } from 'lucide-react';
import { Invoice } from '../../types';

interface InvoiceStatusProps {
  invoices: Invoice[];
  loading?: boolean;
  onPay?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

function toClientStatus(status: string): string {
  const map: Record<string, string> = {
    draft: 'Preparing',
    sent: 'Received',
    viewed: 'Under Review',
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}

const statusConfig: Record<string, { icon: any; bg: string; text: string; label: string }> = {
  Preparing: { icon: Clock, bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', label: 'Preparing' },
  Received: { icon: Eye, bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', label: 'Received' },
  'Under Review': { icon: Eye, bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', label: 'Under Review' },
  Paid: { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Paid' },
  'Partially Paid': { icon: PiggyBank, bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', label: 'Partially Paid' },
  Overdue: { icon: AlertTriangle, bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', label: 'Overdue' },
  Cancelled: { icon: AlertTriangle, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-400', label: 'Cancelled' },
};

function SkeletonSummary() {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl p-2.5 text-center bg-slate-100 dark:bg-slate-800 animate-pulse space-y-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12" />
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InvoiceStatus({ invoices, loading, onPay, onDownload }: InvoiceStatusProps) {
  const paidStatuses = ['paid'];
  const pendingStatuses = ['draft', 'sent', 'viewed', 'partially_paid'];
  const overdueStatuses = ['overdue'];

  const totalPaid = invoices.filter((i) => paidStatuses.includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter((i) => pendingStatuses.includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter((i) => overdueStatuses.includes(i.status)).reduce((sum, i) => sum + i.amount, 0);

  const summaryItems = [
    { label: 'Paid', amount: totalPaid, count: invoices.filter((i) => paidStatuses.includes(i.status)).length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Pending', amount: totalPending, count: invoices.filter((i) => pendingStatuses.includes(i.status)).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Overdue', amount: totalOverdue, count: invoices.filter((i) => overdueStatuses.includes(i.status)).length, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  ];

  const formatCurrency = (amount: number, currency?: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0 }).format(amount || 0);
    } catch {
      return `${currency || 'USD'} ${(amount || 0).toLocaleString()}`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Invoice Status
          </h3>
        </div>
        {!loading && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {invoices.length} invoices
          </span>
        )}
      </div>

      {loading ? (
        <>
          <SkeletonSummary />
          <SkeletonRows />
        </>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No invoices yet</p>
          <p className="text-[10px] text-slate-400 mt-1">Invoices will appear here once generated.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {summaryItems.map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-2.5 text-center`}>
                <p className={`text-xs font-black ${item.color}`}>{formatCurrency(item.amount, invoices[0]?.currency)}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{item.label} ({item.count})</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {invoices.map((inv) => {
              const clientStatus = toClientStatus(inv.status);
              const sc = statusConfig[clientStatus] || statusConfig.Preparing;
              const StatusIcon = sc.icon;

              return (
                <div
                  key={(inv as any)._id || inv.id}
                  className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg ${sc.bg} flex items-center justify-center shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${sc.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{inv.number}</p>
                      <span className={`text-[9px] font-bold whitespace-nowrap ${sc.text}`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(inv.amount, inv.currency)}
                      </span>
                      <span className="text-[9px] text-slate-300">•</span>
                      <span className="text-[9px] text-slate-400">Due {inv.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {inv.status !== 'paid' && onPay && (
                      <button
                        onClick={() => onPay(inv)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                        title="Pay now"
                      >
                        <CreditCard className="w-3 h-3" />
                      </button>
                    )}
                    {onDownload && (
                      <button
                        onClick={() => onDownload(inv)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all"
                        title="Download invoice"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
