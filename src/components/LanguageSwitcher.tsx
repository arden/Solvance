'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from pathname
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => switchLocale(locale === 'en' ? 'zh' : 'en')}
      className="text-slate-400 hover:text-white"
      title={locale === 'en' ? '切换到中文' : 'Switch to English'}
    >
      <Languages className="h-5 w-5" />
      <span className="ml-2 text-sm font-medium">{locale === 'en' ? 'ZH' : 'EN'}</span>
    </Button>
  );
}
