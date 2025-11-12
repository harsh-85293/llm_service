import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface TicketFormProps {
  onSubmit: (request: string) => Promise<void>;
  isSubmitting: boolean;
}

export function TicketForm({ onSubmit, isSubmitting }: TicketFormProps) {
  const [request, setRequest] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim()) {
      await onSubmit(request);
      setRequest('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <label htmlFor="request" className="block text-base font-semibold text-gray-900 dark:text-white">
            Describe your IT request
          </label>
        </div>
        <textarea
          id="request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Example: I need to reset my password, or request access to a specific application..."
          className="w-full px-5 py-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-slate-700"
          rows={5}
          disabled={isSubmitting}
          required
        />
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI will analyze and route your request automatically
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !request.trim()}
            className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
