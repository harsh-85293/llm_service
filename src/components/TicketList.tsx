import { Ticket } from '../lib/supabase';
import { Clock, CheckCircle, AlertCircle, Zap, ArrowUpRight, FileText } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-gray-700 bg-gray-100 border border-gray-200' },
  processing: { label: 'Processing', icon: Clock, color: 'text-blue-700 bg-blue-100 border border-blue-200' },
  automated: { label: 'Auto-Resolved', icon: Zap, color: 'text-emerald-700 bg-emerald-100 border border-emerald-200' },
  escalated: { label: 'Escalated', icon: ArrowUpRight, color: 'text-orange-700 bg-orange-100 border border-orange-200' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-700 bg-green-100 border border-green-200' },
  failed: { label: 'Failed', icon: AlertCircle, color: 'text-red-700 bg-red-100 border border-red-200' },
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-600',
};

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600">
        <div className="bg-gray-200 dark:bg-slate-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-gray-400 dark:text-gray-300" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">No tickets found</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Submit your first IT support request above</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const status = statusConfig[ticket.status];
        const StatusIcon = status.icon;

        return (
          <div
            key={ticket.id}
            onClick={() => onTicketClick?.(ticket)}
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md border-l-4 ${priorityColors[ticket.priority]} border-r border-t border-b border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${onTicketClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                    {status.label}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 px-3 py-1.5 rounded-full">
                    {ticket.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <span className="font-semibold capitalize">{ticket.priority}</span> Priority
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-base leading-relaxed">
                  {ticket.request_text.length > 150
                    ? `${ticket.request_text.substring(0, 150)}...`
                    : ticket.request_text}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                {ticket.auto_resolved && (
                  <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto-resolved
                  </span>
                )}
                {ticket.complexity_score > 0 && (
                  <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">Complexity: {ticket.complexity_score}/10</span>
                )}
              </div>
              {ticket.completed_at && (
                <span className="text-gray-400 font-medium">
                  Completed {new Date(ticket.completed_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {ticket.resolution_notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-slate-700 p-4 rounded-xl border border-blue-100 dark:border-slate-600">
                  <span className="font-semibold text-blue-900 dark:text-cyan-400">Resolution: </span>
                  {ticket.resolution_notes}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
