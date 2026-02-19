interface StatusBarProps {
  message: string;
}

export default function StatusBar({ message }: StatusBarProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <span className="text-sm text-blue-700">{message}</span>
    </div>
  );
}
