import { useState, useEffect, type ComponentType } from 'react';
import { Ticket, AuditLog } from '../lib/supabase';
import { TicketList } from './TicketList';
import { Footer } from './Footer';
import { TicketService } from '../services/ticketService';
import { EmployeeInterface } from './EmployeeInterface';
import { BarChart3, Clock, Zap, Activity, ArrowUpRight } from 'lucide-react';

interface AdminDashboardProps {
  ticketService: TicketService;
}

interface Stats {
  total: number;
  pending: number;
  escalated: number;
  automated: number;
  completed: number;
  avgComplexity: number;
}

export function AdminDashboard({ ticketService }: AdminDashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    escalated: 0,
    automated: 0,
    completed: 0,
    avgComplexity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [tokenHolderId, setTokenHolderId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await api.getUsers();
      const users = Array.isArray(response) ? response : (response.users || []);
      const adminUsers = users
        .filter((user: { role: string }) => user.role === 'admin' || user.role === 'super_admin')
        .map((user: { _id: string; id?: string; name: string }) => ({
          id: user.id || user._id,
          name: user.name,
        }));
      setEmployees(adminUsers);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    const data = await ticketService.getAllTickets();
    setTickets(data);
    calculateStats(data);
    setLoading(false);
  };

  const calculateStats = (tickets: Ticket[]) => {
    const total = tickets.length;
    const pending = tickets.filter((t) => t.status === 'pending' || t.status === 'processing').length;
    const escalated = tickets.filter((t) => t.status === 'escalated').length;
    const automated = tickets.filter((t) => t.auto_resolved).length;
    const completed = tickets.filter((t) => t.status === 'completed').length;
    const avgComplexity = total > 0
      ? tickets.reduce((sum, t) => sum + t.complexity_score, 0) / total
      : 0;

    setStats({ total, pending, escalated, automated, completed, avgComplexity });
  };

  const handleTicketClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const ticketLogs = await ticketService.getTicketLogs(ticket.id);
    setLogs(ticketLogs);
  };

  const handleUpdateStatus = async (status: string, notes?: string) => {
    if (!selectedTicket) return;

    await ticketService.updateTicketStatus(selectedTicket.id, status, notes);
    setSelectedTicket(null);
    loadTickets();
  };

  const handleAssignToTokenHolder = async () => {
    if (!selectedTicket || !tokenHolderId) return;
    const tokenHolder = employees.find(e => e.id === tokenHolderId);
    if (!tokenHolder) return;
    await ticketService.assignTicketToEmployee(selectedTicket.id, tokenHolder.name);
    setSelectedTicket(null);
    loadTickets();
  };

  const handleAssignToEmployee = async (employeeName: string) => {
    if (!selectedTicket) return;
    await ticketService.assignTicketToEmployee(selectedTicket.id, employeeName);
    setSelectedTicket(null);
    loadTickets();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard" className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor and manage IT support requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={BarChart3}
            color="bg-blue-500"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="bg-orange-500"
          />
          <StatCard
            title="Auto-Resolved"
            value={stats.automated}
            icon={Zap}
            color="bg-green-500"
            subtitle={`${stats.total > 0 ? Math.round((stats.automated / stats.total) * 100) : 0}% automation rate`}
          />
          <StatCard
            title="Escalated"
            value={stats.escalated}
            icon={ArrowUpRight}
            color="bg-red-500"
          />
        </div>

        <div className="mb-8">
          <EmployeeInterface onTokenChange={setTokenHolderId} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-cyan-400" />
            All Tickets
          </h2>
          <TicketList tickets={tickets} onTicketClick={handleTicketClick} />
        </div>

        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            logs={logs}
            onClose={() => setSelectedTicket(null)}
            onUpdateStatus={handleUpdateStatus}
            employees={employees}
            tokenHolderId={tokenHolderId}
            onAssignToTokenHolder={handleAssignToTokenHolder}
            onAssignToEmployee={handleAssignToEmployee}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function TicketDetailModal({
  ticket,
  logs,
  onClose,
  onUpdateStatus,
  employees,
  tokenHolderId,
  onAssignToTokenHolder,
  onAssignToEmployee,
}: {
  ticket: Ticket;
  logs: AuditLog[];
  onClose: () => void;
  onUpdateStatus: (status: string, notes?: string) => void;
  employees: Array<{ id: string; name: string }>;
  tokenHolderId: string | null;
  onAssignToTokenHolder: () => void;
  onAssignToEmployee: (employeeName: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const tokenHolder = employees.find(e => e.id === tokenHolderId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span>{' '}
              <span className="capitalize">{ticket.status}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Category:</span>{' '}
              <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Priority:</span>{' '}
              <span className="capitalize">{ticket.priority}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Complexity:</span> {ticket.complexity_score}/10
            </p>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Request</h3>
          <p className="text-gray-700">{ticket.request_text}</p>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Activity Log</h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">
                    {log.action_type.replace('_', ' ')}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ticket.status !== 'completed' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Update Ticket</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add resolution notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => onUpdateStatus('completed', notes)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => onUpdateStatus('escalated', notes)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Escalate
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'escalated' && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Assign to Employee</h3>
            
            {tokenHolder && (
              <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">🎯 Current Token Holder</p>
                    <p className="text-lg font-bold text-yellow-700">{tokenHolder.name}</p>
                  </div>
                  <button
                    onClick={onAssignToTokenHolder}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                  >
                    Assign to Token Holder
                  </button>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-3">Or assign to a specific employee:</p>
            <div className="grid grid-cols-2 gap-2">
              {employees.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onAssignToEmployee(e.name)}
                  className={`text-sm text-left border rounded-lg px-3 py-2 transition-colors ${
                    e.id === tokenHolderId
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-900 font-semibold hover:bg-yellow-100'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {e.id === tokenHolderId && '🎯 '}
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
