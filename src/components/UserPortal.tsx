import { useState, useEffect } from 'react';
import { Ticket } from '../lib/supabase';
import { TicketForm } from './TicketForm';
import { TicketList } from './TicketList';
import { Footer } from './Footer';
import { TicketService } from '../services/ticketService';
import { Headphones, TrendingUp, Zap, CheckCircle, Activity, X } from 'lucide-react';

interface UserPortalProps {
  userId: string;
  userName: string;
  ticketService: TicketService;
}

export function UserPortal({ userId, userName, ticketService }: UserPortalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadTickets();
  }, [userId]);

  const loadTickets = async () => {
    const data = await ticketService.getUserTickets();
    setTickets(data);
  };

  const handleSubmit = async (request: string) => {
    setIsSubmitting(true);
    setNotification(null);

    try {
      const { ticket, error } = await ticketService.createTicket(request);

      if (error) {
        setNotification({
          type: 'error',
          message: error,
        });
      } else if (ticket) {
        setNotification({
          type: 'success',
          message: ticket.auto_resolved
            ? 'Your request has been automatically resolved!'
            : 'Your request has been submitted successfully.',
        });
        loadTickets();
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => ['pending', 'processing', 'escalated'].includes(t.status)).length,
    completed: tickets.filter((t) => t.status === 'completed').length,
    automated: tickets.filter((t) => t.auto_resolved).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col transition-colors">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">IT Support Portal</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">Welcome back, <span className="font-semibold text-blue-600 dark:text-cyan-400">{userName}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={TrendingUp}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="In Progress"
            value={stats.pending}
            icon={Zap}
            gradient="from-orange-500 to-orange-600"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Auto-Resolved"
            value={stats.automated}
            icon={Zap}
            gradient="from-emerald-500 to-emerald-600"
          />
        </div>

        {notification && (
          <div
            className={`mb-8 p-5 rounded-xl shadow-sm border-l-4 ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-200'
            } animate-in slide-in-from-top-2 duration-300`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
                {notification.message}
              </p>
              <button
                onClick={() => setNotification(null)}
                className="text-current hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit a New Request</h2>
          </div>
          <TicketForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Requests</h2>
          </div>
          <TicketList tickets={tickets} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white">{value}</div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
    </div>
  );
}
