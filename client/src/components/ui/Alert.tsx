import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ type = 'error', message, onClose, className }: AlertProps) {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  };
  const Icon = icons[type];

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-4', styles[type], className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 rounded p-1 hover:bg-black/5">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
