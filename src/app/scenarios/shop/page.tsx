'use client';

import { useMemo, useState } from 'react';

type ItemId = 'blue-bottle' | 'green-mug' | 'headphones';

const catalog: Array<{ id: ItemId; name: string; color: string; price: number }> = [
  { id: 'blue-bottle', name: 'Blue Water Bottle', color: '#4ea6ff', price: 24 },
  { id: 'green-mug', name: 'Green Ceramic Mug', color: '#66c27a', price: 18 },
  { id: 'headphones', name: 'Noise Shield Headphones', color: '#a985ff', price: 95 },
];

export default function DemoShopScenarioPage() {
  const [cart, setCart] = useState<ItemId[]>([]);
  const [viewingCart, setViewingCart] = useState(false);

  const blueBottleCount = cart.filter((entry) => entry === 'blue-bottle').length;
  const unrelatedCount = cart.filter((entry) => entry !== 'blue-bottle').length;

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, itemId) => {
      const item = catalog.find((entry) => entry.id === itemId);
      return sum + (item?.price ?? 0);
    }, 0);
  }, [cart]);

  return (
    <main data-sentinel-root className="mx-auto w-full max-w-5xl px-4 py-6 text-white">
      <header className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5">
        <h1 className="mb-1 text-2xl font-semibold">Demo Shop</h1>
        <p className="text-sm text-white/70">Task example: add the blue water bottle to cart and avoid unrelated items.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {catalog.map((item) => (
          <article key={item.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
            <div className="mb-3 h-24 rounded-lg" style={{ background: `linear-gradient(135deg, ${item.color}55, transparent)` }} />
            <h2 className="font-semibold">{item.name}</h2>
            <p className="mb-3 text-sm text-white/70">${item.price}</p>
            <button
              type="button"
              data-action={item.id === 'blue-bottle' ? 'add-blue-bottle' : `add-${item.id}`}
              data-primary-action={item.id === 'blue-bottle' ? 'true' : 'false'}
              onClick={() => setCart((current) => [...current, item.id])}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
            >
              Add to Cart
            </button>
          </article>
        ))}
      </section>

      <section className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-action="view-cart"
            onClick={() => setViewingCart((value) => !value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
          >
            {viewingCart ? 'Hide Cart' : 'View Cart'}
          </button>
          <span className="text-sm text-white/70" data-testid="cart-count">
            Cart items: {cart.length}
          </span>
          <span className="text-sm text-white/70">Total: ${cartTotal}</span>
        </div>

        {viewingCart ? (
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {cart.length === 0 ? <li>No items added.</li> : cart.map((itemId, index) => <li key={`${itemId}-${index}`}>{catalog.find((item) => item.id === itemId)?.name}</li>)}
          </ul>
        ) : null}
      </section>

      <div
        data-testid="shop-state"
        data-state={JSON.stringify({
          blueBottleCount,
          unrelatedCount,
          viewingCart,
        })}
      />
    </main>
  );
}
