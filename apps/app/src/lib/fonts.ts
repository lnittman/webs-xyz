export const fonts = [
  { id: 'iosevka-term', name: 'Iosevka Term', className: 'font-iosevka-term' },
  { id: 'geist-mono', name: 'Geist Mono', className: 'font-geist-mono' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', className: 'font-jetbrains-mono' },
  { id: 'fira-code', name: 'Fira Code', className: 'font-fira-code' },
  { id: 'commit-mono', name: 'Commit Mono', className: 'font-commit-mono' },
  { id: 'departure-mono', name: 'Departure Mono', className: 'font-departure-mono' },
  { id: 'fragment-mono', name: 'Fragment Mono', className: 'font-fragment-mono' },
  { id: 'server-mono', name: 'Server Mono', className: 'font-server-mono' },
  { id: 'sfmono-square', name: 'SF Mono Square', className: 'font-sfmono-square' },
  { id: 'tx02-mono', name: 'TX02 Mono', className: 'font-tx02-mono' },
];

export function getFontValue(fontId: string): string {
  switch (fontId) {
    case 'iosevka-term':
      return "'IosevkaTerm-Regular', Consolas, monaco, monospace";
    case 'geist-mono':
      return "'GeistMono-Regular', Consolas, monaco, monospace";
    case 'jetbrains-mono':
      return "'JetBrainsMono-Regular', Consolas, monaco, monospace";
    case 'fira-code':
      return "'FiraCode-Regular', Consolas, monaco, monospace";
    case 'commit-mono':
      return "'CommitMono-Regular', Consolas, monaco, monospace";
    case 'departure-mono':
      return "'DepartureMono-Regular', Consolas, monaco, monospace";
    case 'fragment-mono':
      return "'FragmentMono-Regular', Consolas, monaco, monospace";
    case 'server-mono':
      return "'ServerMono-Regular', Consolas, monaco, monospace";
    case 'sfmono-square':
      return "'SFMonoSquare-Regular', Consolas, monaco, monospace";
    case 'tx02-mono':
      return "'TX02Mono-Regular', Consolas, monaco, monospace";
    default:
      return "'IosevkaTerm-Regular', Consolas, monaco, monospace";
  }
}

export function applyFont(fontId: string): void {
  const font = fonts.find(f => f.id === fontId);
  if (font) {
    // Update CSS custom property directly for immediate effect
    const fontValue = getFontValue(fontId);
    document.documentElement.style.setProperty('--font-mono', fontValue);
    
    // Also add the font class to document root for consistency
    fonts.forEach(f => document.documentElement.classList.remove(f.className));
    document.documentElement.classList.add(font.className);
  }
} 