'use client';

import { useState, type KeyboardEvent } from 'react';
import type { DuelFeedItem, DuelFeedTone } from '@/lib/sentinel/duel-feed';

export function DuelActivityFeed({
  title,
  subtitle,
  tone,
  items,
  emptyMessage,
}: {
  title: string;
  subtitle?: string;
  tone: DuelFeedTone;
  items: DuelFeedItem[];
  emptyMessage: string;
}) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  function toggleItem(id: string) {
    setOpenItems((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function onItemKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    toggleItem(id);
  }

  return (
    <section className={`duel-feed duel-feed-${tone}`}>
      <div className="duel-feed-headline">
        <h3 className="duel-feed-title">{title}</h3>
        {subtitle ? <p className="duel-feed-subtitle">{subtitle}</p> : null}
      </div>

      {items.length === 0 ? (
        <div className="duel-feed-empty">{emptyMessage}</div>
      ) : (
        <ul className="duel-feed-list">
          {items.map((item) => {
            const isOpen = Boolean(openItems[item.id]);
            const detailsId = `${item.id}-details`;

            return (
              <li key={item.id}>
                <article
                  className={`duel-feed-item ${isOpen ? 'is-open' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={(event) => onItemKeyDown(event, item.id)}
                >
                  <div className="duel-feed-row">
                    <span className="duel-feed-caret" aria-hidden="true">
                      ▸
                    </span>

                    <div className="duel-feed-row-main">
                      <div className="duel-feed-row-top">
                        <p className="duel-feed-summary">{item.summary}</p>
                        {item.badges?.length ? (
                          <div className="duel-feed-badges">
                            {item.badges.map((badge) => (
                              <span
                                key={`${item.id}-${badge.label}`}
                                className={`duel-feed-badge ${badge.tone ? `is-${badge.tone}` : ''}`}
                              >
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="duel-feed-panel" id={detailsId}>
                    <div className="duel-feed-panel-inner">
                      <p className="duel-feed-description">{item.description}</p>

                      {item.details?.length ? (
                        <div className="duel-feed-detail-grid">
                          {item.details.map((detail) => (
                            <div key={`${item.id}-${detail.label}`} className="duel-feed-detail-row">
                              <span className="duel-feed-detail-label">{detail.label}</span>
                              <span className="duel-feed-detail-value">{detail.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {item.payload ? (
                        <div className="duel-feed-payload" onClick={(event) => event.stopPropagation()}>
                          <p className="duel-feed-payload-label">{item.payloadLabel ?? 'Injection Payload'}</p>
                          <pre>{item.payload}</pre>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
