'use client';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No data found' }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
}
