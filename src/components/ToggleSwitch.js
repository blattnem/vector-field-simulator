import React from 'react';

const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="toggle-switch">
    <label>
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="slider"></span>
    </label>
  </div>
);

export default ToggleSwitch;