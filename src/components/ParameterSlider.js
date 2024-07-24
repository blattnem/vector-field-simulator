// src/components/ParameterSlider.js
import React from 'react';

const ParameterSlider = ({ label, value, min, max, onChange }) => {
  return (
    <div className="parameter-slider">
      <label>{label}: {value.toFixed(2)}</label>
      <input
        type="range"
        min={min}
        max={max}
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default ParameterSlider;