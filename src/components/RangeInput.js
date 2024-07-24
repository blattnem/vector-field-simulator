import React from 'react';

const RangeInput = ({ label, min, max, onMinChange, onMaxChange }) => {
  return (
    <div className="range-input">
      <label>{label}</label>
      <div>
        <input
          type="number"
          value={min}
          onChange={(e) => onMinChange(parseFloat(e.target.value))}
          step="any"
        />
        <span> to </span>
        <input
          type="number"
          value={max}
          onChange={(e) => onMaxChange(parseFloat(e.target.value))}
          step="any"
        />
      </div>
    </div>
  );
};

export default RangeInput;