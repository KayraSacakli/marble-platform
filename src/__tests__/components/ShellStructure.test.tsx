// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

// Verify all navigation components are exported
import { SkipNavigation } from '@/components/navigation/SkipNavigation';
import { BrandLogo } from '@/components/navigation/BrandLogo';
import { DesktopNavigation } from '@/components/navigation/DesktopNavigation';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { HeaderInteractive } from '@/components/navigation/HeaderInteractive';

describe('Navigation — Component Exports', () => {
  it('exports all navigation components', () => {
    expect(SkipNavigation).toBeDefined();
    expect(BrandLogo).toBeDefined();
    expect(DesktopNavigation).toBeDefined();
    expect(LanguageSwitcher).toBeDefined();
    expect(MobileMenu).toBeDefined();
    expect(HeaderInteractive).toBeDefined();
  });
});
