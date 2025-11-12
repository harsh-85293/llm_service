import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { EmployeeCard, type Employee } from './EmployeeCard';
import { Users, RefreshCw, AlertCircle } from 'lucide-react';

interface EmployeeInterfaceProps {
  onTokenChange?: (tokenHolderId: string | null) => void;
}

export function EmployeeInterface({ onTokenChange }: EmployeeInterfaceProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tokenHolderId, setTokenHolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    // Check cache - only fetch if more than 5 minutes have passed
    if (lastFetchTime) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (lastFetchTime > fiveMinutesAgo) {
        return; // Use cached data
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.getUsers();
      const users = Array.isArray(response) ? response : (response.users || []);
      
      // Filter for admin and super_admin roles
      const adminUsers: Employee[] = users
        .filter((user: { role: string }) => 
          user.role === 'admin' || user.role === 'super_admin'
        )
        .map((user: { _id: string; id?: string; name: string; email: string; role: 'admin' | 'super_admin'; last_login: string }) => ({
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          last_login: user.last_login,
        }));

      setEmployees(adminUsers);
      setLastFetchTime(new Date());

      // Assign token on initial load if not already assigned
      if (!tokenHolderId && adminUsers.length > 0) {
        assignRandomToken(adminUsers);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Unable to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectRandomEmployee = (employeeList: Employee[]): Employee => {
    const randomIndex = Math.floor(Math.random() * employeeList.length);
    return employeeList[randomIndex];
  };

  const assignRandomToken = (employeeList: Employee[] = employees) => {
    if (employeeList.length === 0) {
      setTokenHolderId(null);
      onTokenChange?.(null);
      return;
    }

    const selected = selectRandomEmployee(employeeList);
    setTokenHolderId(selected.id);
    onTokenChange?.(selected.id);
  };

  const reassignToken = () => {
    assignRandomToken();
  };

  const isEmployeeOnline = (lastLogin: string): boolean => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const lastLoginDate = new Date(lastLogin);
    return lastLoginDate > fifteenMinutesAgo;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchEmployees}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No employees available for token assignment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-cyan-400" />
          Employee Escalation Token
        </h2>
        <button
          onClick={reassignToken}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Reassign Token
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            hasToken={employee.id === tokenHolderId}
            isOnline={isEmployeeOnline(employee.last_login)}
          />
        ))}
      </div>
    </div>
  );
}
