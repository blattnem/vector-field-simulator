import React from 'react';

const FunctionInput = ({ label, value, onChange }) => (
  <div className="function-input">
    <label>{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default FunctionInput;