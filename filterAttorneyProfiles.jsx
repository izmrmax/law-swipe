import React, { useState, useRef, useEffect } from 'react';

const REGIONS = ['Northeast', 'Midwest', 'South', 'West'];
const PRACTICE_AREAS = ['Family Law', 'Criminal Defense', 'Personal Injury', 'Corporate Law', 'Immigration'];
const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'French'];
const GENDERS = ['Male', 'Female', 'Non-binary'];

const BASE_FILTERS = {
  region: '',
  practiceAreas: [],
  rating: [0, 5],
  languages: [],
  gender: '',
  availability: false
};

export default function FilterAttorneyProfiles({
  isOpen,
  initialFilters = {},
  onApply,
  onCancel
}) {
  const panelRef = useRef(null);
  const defaultFilters = { ...BASE_FILTERS, ...initialFilters };
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    setFilters({ ...BASE_FILTERS, ...initialFilters });
  }, [initialFilters]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectChange = (key) => (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiToggle = (key, value) => () => {
    setFilters(prev => {
      const list = Array.isArray(prev[key]) ? [...prev[key]] : [];
      const idx = list.indexOf(value);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(value);
      return { ...prev, [key]: list };
    });
  };

  const handleRatingChange = (idx) => (e) => {
    const val = Number(e.target.value);
    setFilters(prev => {
      const rating = [...prev.rating];
      rating[idx] = val;
      if (idx === 0 && val > rating[1]) rating[1] = val;
      if (idx === 1 && val < rating[0]) rating[0] = val;
      return { ...prev, rating };
    });
  };

  const handleToggle = (e) => {
    const { checked } = e.target;
    setFilters(prev => ({ ...prev, availability: checked }));
  };

  const handleClear = () => {
    setFilters({ ...BASE_FILTERS });
  };

  const handleApply = () => {
    onApply(filters);
  };

  if (!isOpen) return null;

  return (
    <div className="filter-panel-overlay">
      <div
        className="filter-panel"
        role="dialog"
        aria-modal="true"
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="filter-panel-header">
          <h2>Filter Attorneys</h2>
          <button type="button" className="close-btn" onClick={onCancel}>?</button>
        </header>
        <div className="filter-panel-body">
          <section className="filter-group">
            <label>Region</label>
            <select
              value={filters.region}
              onChange={handleSelectChange('region')}
              autoFocus
            >
              <option value="">Any</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </section>
          <section className="filter-group">
            <label>Practice Areas</label>
            <div className="checkbox-group">
              {PRACTICE_AREAS.map(area => (
                <label key={area}>
                  <input
                    type="checkbox"
                    checked={filters.practiceAreas.includes(area)}
                    onChange={handleMultiToggle('practiceAreas', area)}
                  />
                  {area}
                </label>
              ))}
            </div>
          </section>
          <section className="filter-group">
            <label>Star Rating</label>
            <div className="rating-sliders">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating[0]}
                onChange={handleRatingChange(0)}
              />
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating[1]}
                onChange={handleRatingChange(1)}
              />
              <div className="rating-values">
                <span>{filters.rating[0]}?</span> ? <span>{filters.rating[1]}?</span>
              </div>
            </div>
          </section>
          <section className="filter-group">
            <label>Languages</label>
            <div className="checkbox-group">
              {LANGUAGES.map(lang => (
                <label key={lang}>
                  <input
                    type="checkbox"
                    checked={filters.languages.includes(lang)}
                    onChange={handleMultiToggle('languages', lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </section>
          <section className="filter-group">
            <label>Gender</label>
            <div className="radio-group">
              {GENDERS.map(g => (
                <label key={g}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={filters.gender === g}
                    onChange={handleSelectChange('gender')}
                  />
                  {g}
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  name="gender"
                  value=""
                  checked={filters.gender === ''}
                  onChange={handleSelectChange('gender')}
                />
                Any
              </label>
            </div>
          </section>
          <section className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.availability}
                onChange={handleToggle}
              />
              Available Now
            </label>
          </section>
        </div>
        <footer className="filter-panel-footer">
          <button type="button" className="clear-btn" onClick={handleClear}>Clear</button>
          <button type="button" className="apply-btn" onClick={handleApply}>Apply</button>
        </footer>
      </div>
    </div>
  );
}