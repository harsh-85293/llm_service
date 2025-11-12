import { User, Shield, ShieldCheck } from 'lucide-react';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  last_login: string;
}

interface EmployeeCardProps {
  employee: Employee;
  hasToken: boolean;
  isOnline: boolean;
}

export function EmployeeCard({ employee, hasToken, isOnline }: EmployeeCardProps) {
  return (
    <div
      className={`
        relative rounded-lg p-4 transition-all
        ${hasToken 
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 shadow-lg' 
          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm'
        }
      `}
    >
      {hasToken && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
          🎯 Token Holder
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`
          p-3 rounded-lg
          ${hasToken ? 'bg-yellow-500' : 'bg-blue-500'}
        `}>
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {employee.name}
            </h3>
            <div
              className={`
                w-2 h-2 rounded-full
                ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
              `}
              title={isOnline ? 'Online' : 'Offline'}
            />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">
            {employee.email}
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            {employee.role === 'super_admin' ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            <span className="capitalize">{employee.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
