import { ExpenseCategory } from '@/types';
import {
  ShoppingCart,
  Car,
  UtensilsCrossed,
  Gamepad2,
  Zap,
  Heart,
  ShoppingBag,
  Plane,
  GraduationCap,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';

const categoryConfig: Record<
  ExpenseCategory,
  { icon: any; bgColor: string; textColor: string }
> = {
  groceries: { icon: ShoppingCart, bgColor: 'bg-green-100', textColor: 'text-green-700' },
  transport: { icon: Car, bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  dining: { icon: UtensilsCrossed, bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  entertainment: { icon: Gamepad2, bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  utilities: { icon: Zap, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  healthcare: { icon: Heart, bgColor: 'bg-red-100', textColor: 'text-red-700' },
  shopping: { icon: ShoppingBag, bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
  travel: { icon: Plane, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
  education: { icon: GraduationCap, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  subscriptions: { icon: CreditCard, bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
  other: { icon: MoreHorizontal, bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
};

export default function CategoryBadge({
  category,
  size = 'default',
}: {
  category: ExpenseCategory | string;
  size?: 'sm' | 'default';
}) {
  const config = categoryConfig[category as ExpenseCategory] || categoryConfig.other;
  const Icon = config.icon;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor} ${config.textColor} ${textSize} font-medium`}
    >
      <Icon className={iconSize} />
      <span className="capitalize">{category}</span>
    </span>
  );
}
