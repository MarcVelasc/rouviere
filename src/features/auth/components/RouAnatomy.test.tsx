import { act, render, screen } from '@testing-library/react';
import { RouAnatomy } from './RouAnatomy';

describe('Rou por capas', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('pasa solo por huesos, músculos, nervios y completo, y vuelve a empezar', () => {
    render(<RouAnatomy interval={1000} />);
    const rou = screen.getByRole('img', { name: /Rou/ });
    const seen = [rou.dataset.layer];
    for (let i = 0; i < 4; i++) {
      act(() => vi.advanceTimersByTime(1000));
      seen.push(rou.dataset.layer);
    }
    expect(seen).toEqual(['huesos', 'musculos', 'nervios', 'completo', 'huesos']);
  });

  it('con "reducir movimiento" se queda quieto en completo', () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    try {
      render(<RouAnatomy interval={1000} />);
      const rou = screen.getByRole('img', { name: /Rou/ });
      act(() => vi.advanceTimersByTime(3000));
      expect(rou.dataset.layer).toBe('completo');
    } finally {
      window.matchMedia = original;
    }
  });
});
