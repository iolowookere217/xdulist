import { Plus } from 'lucide-react';

export default function QuickAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
      aria-label="Add expense"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
