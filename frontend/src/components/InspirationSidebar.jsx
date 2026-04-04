import React, { useEffect, useMemo, useState } from 'react';
import { getInspirationGallery, searchInspiration } from '../api';

function clampText(text, maxChars) {
  if (!text) return '';
  const s = String(text);
  if (s.length <= maxChars) return s;
  return s.slice(0, maxChars - 1).trimEnd() + '…';
}

export default function InspirationSidebar() {
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryWarning, setGalleryWarning] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const canSearch = useMemo(() => searchTerm.trim().length >= 2, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    async function loadGallery() {
      setGalleryLoading(true);
      setError(null);
      setGalleryWarning(null);
      try {
        const data = await getInspirationGallery();
        if (cancelled) return;
        setGallery(Array.isArray(data?.items) ? data.items : []);
        if (data?.warning) setGalleryWarning(String(data.warning));
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Could not load inspiration gallery.');
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    }
    loadGallery();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const term = searchTerm.trim();

    // Debounce search to avoid hammering the API while typing.
    const t = setTimeout(async () => {
      if (!canSearch || cancelled) return;
      setSearchLoading(true);
      setError(null);
      try {
        const data = await searchInspiration(term);
        if (cancelled) return;
        setSearchResults(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Search failed.');
        setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchTerm, canSearch]);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <section className="inspiration-section" aria-label="Inspiration">
      <div className="inspiration-heading">
        <div className="inspiration-heading-left">
          <h2 className="inspiration-title">Inspiration</h2>
          <div className="inspiration-subtitle">Broadway playbill photos</div>
        </div>
      </div>

      <div className="inspiration-block">
        <div className="inspiration-block-title">
          Featured gallery
        </div>

        {galleryLoading ? (
          <div className="inspiration-loading">Curating playbills…</div>
        ) : error ? (
          <div className="inspiration-error">{error}</div>
        ) : galleryWarning ? (
          <div className="inspiration-empty">{galleryWarning}</div>
        ) : (
          <div className="playbill-gallery" role="list" aria-label="Featured images">
            {gallery.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={'playbill-thumb' + (idx % 2 === 0 ? ' playbill-thumb--tilt-left' : ' playbill-thumb--tilt-right')}
                onClick={() => setSelected(item)}
                aria-label={`Open inspiration: ${item.title}`}
              >
                <img className="playbill-thumb-img" src={item.imageUrl} alt={item.title} loading="lazy" />
                <span className="playbill-thumb-title">{clampText(item.title, 26)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="inspiration-block inspiration-block--search">
        <div className="inspiration-block-title">Search</div>
        <label className="inspiration-search-label" htmlFor="inspiration-search-input">
          Find a show or actor
        </label>
        <input
          id="inspiration-search-input"
          className="inspiration-search-input"
          value={searchTerm}
          placeholder='Try "Hamilton" or "Idina Menzel"'
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="inspiration-search-hint">
          {canSearch ? 'Showing matches for your query…' : 'Type 2+ characters to see photos.'}
        </div>

        {error && <div className="inspiration-error">{error}</div>}

        {canSearch && (
          <div className="playbill-results" aria-live="polite">
            {searchLoading ? (
              <div className="inspiration-loading">Searching…</div>
            ) : searchResults.length === 0 ? (
              <div className="inspiration-empty">No images found. Try another name.</div>
            ) : (
              <div className="playbill-results-grid">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="playbill-result-card"
                    onClick={() => setSelected(item)}
                  >
                    <img className="playbill-result-img" src={item.imageUrl} alt={item.title} loading="lazy" />
                    <div className="playbill-result-meta">
                      <div className="playbill-result-title">{item.title}</div>
                      <div className="playbill-result-desc">{clampText(item.description, 120)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="playbill-modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="playbill-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Playbill inspiration details"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="playbill-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="playbill-modal-hero">
              <img className="playbill-modal-img" src={selected.imageUrl} alt={selected.title} />
            </div>
            <div className="playbill-modal-body">
              <h3 className="playbill-modal-title">{selected.title}</h3>
              {selected.description && (
                <p className="playbill-modal-desc">{selected.description}</p>
              )}
              <div className="playbill-modal-actions">
                <a
                  className="btn btn-gold playbill-modal-link"
                  href={selected.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read on Wikipedia
                </a>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelected(null)}
                >
                  Keep browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

