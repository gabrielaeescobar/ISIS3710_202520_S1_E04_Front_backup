'use client';

import { usePathname } from 'next/navigation';

export default function Main({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCalendar = pathname?.startsWith('/calendario');

  const cls = isCalendar
    ? 'flex-1 min-w-0 p-0'    
    : 'flex-1 min-w-0 p-6'; 

  return <main className={cls}>{children}</main>;
}
