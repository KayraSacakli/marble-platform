import type { Locale } from '@/types/locale';
import type { NavigationItem, UtilityNavigationItem } from '@/types/api';
import { getNavigation } from '@/lib/data/navigation';
import { HeaderInteractive } from './HeaderInteractive';

interface HeaderProps {
  locale: Locale;
  currentPath: string;
}

export async function Header({ locale, currentPath }: HeaderProps) {
  let primaryItems: NavigationItem[] = [];
  let utilityItems: UtilityNavigationItem[] = [];

  try {
    const nav = await getNavigation(locale);
    primaryItems = nav.primary;
    utilityItems = nav.utility;
  } catch {
    primaryItems = [];
    utilityItems = [];
  }

  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <HeaderInteractive
          primaryItems={primaryItems}
          utilityItems={utilityItems}
          locale={locale}
          currentPath={currentPath}
        />
      </div>
    </header>
  );
}
