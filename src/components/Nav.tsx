import { Compass, Layers, MessageCircleQuestion, Map, Info } from 'lucide-react';
import type { Page } from '@/types';

interface NavProps {
  current: Page;
  onNavigate: (page: Page) => void;
  memoryCount: number;
}

const NAV_ITEMS: { id: Page; label: string; icon: typeof Compass }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Compass },
  { id: 'vault', label: 'Memory Vault', icon: Layers },
  { id: 'ask', label: 'Ask My Past', icon: MessageCircleQuestion },
  { id: 'map', label: 'Knowledge Map', icon: Map },
  { id: 'about', label: 'About', icon: Info },
];

export function Nav({ current, onNavigate, memoryCount }: NavProps) {
  return (
    <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-ink-900/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center group-hover:bg-clay-600 transition-colors">
              <Compass className="w-5 h-5 text-canvas" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-serif text-lg font-semibold tracking-tight text-ink-900">
                Archaeologist
              </span>
              <span className="text-[10px] text-ink-500 tracking-wide uppercase">
                Memory Reconstruction
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-ink-900 text-canvas'
                      : 'text-ink-500 hover:text-ink-900 hover:bg-ink-900/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay-50 border border-clay-200">
              <Layers className="w-3.5 h-3.5 text-clay-600" />
              <span className="text-xs font-medium text-clay-700">{memoryCount} memories</span>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-thin pb-2 -mx-1 px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-ink-900 text-canvas'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-ink-900/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
