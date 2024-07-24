// src/components/ColorSchemeSelector.js
import React from 'react';

const ColorSchemeSelector = ({ value, onChange, schemes }) => {
  return (
    <div className="color-scheme-selector">
      <label>Color Scheme:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(schemes).map(([key, scheme]) => (
          <option key={key} value={key}>
            {scheme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ColorSchemeSelector;