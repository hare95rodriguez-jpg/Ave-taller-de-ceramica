import type { Metadata } from 'next';

import { PanelApp } from '@/components/panel-app';

export const metadata: Metadata = { title: 'Panel del taller' };

export default function Panel() {
  return (
    <main>
      <PanelApp />
    </main>
  );
}
