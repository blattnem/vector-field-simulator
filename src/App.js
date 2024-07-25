import React, { useState } from 'react';
import VectorFieldVisualization from './components/VectorFieldVisualization';
import './App.css';


const colorSchemes = {
  ocean: {
    name: 'Ocean',
    getColor: (angle, alpha = 1) => `hsla(${180 + angle * 60 / Math.PI}, 100%, 50%, ${alpha})`,
  },
  fire: {
    name: 'Fire',
    getColor: (angle, alpha = 1) => `hsla(${angle * 60 / Math.PI}, 100%, 50%, ${alpha})`,
  },
  rainbow: {
    name: 'Rainbow',
    getColor: (angle, alpha = 1) => `hsla(${angle * 180 / Math.PI}, 100%, 50%, ${alpha})`,
  },
  grayscale: {
    name: 'Grayscale',
    getColor: (angle, alpha = 1) => {
      const value = Math.abs(Math.sin(angle)) * 255;
      return `rgba(${value}, ${value}, ${value}, ${alpha})`;
    },
  },
  velocity: {
    name: 'Velocity',
    getColor: (angle, alpha = 1, magnitude = 0) => {
      const hue = magnitude * 240; // Map magnitude to hue (0 to 240)
      return `hsla(${hue}, 100%, 50%, ${alpha})`;
    },
  },
};

function App() {
  const [dx, setDx] = useState('a*x*(1-x)*(x-1) -y + 2.1');
  const [dy, setDy] = useState('b*y*(1-y)*(1-x)');
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [a, setA] = useState('4');
  const [b, setB] = useState('1.5');
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [backgroundColor, setBackgroundColor] = useState('#000014');
  const [traceMode, setTraceMode] = useState(false);

  const handleParameterChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const generateRandomEquation = () => {
    const terms = ['x', 'y'];
    const operators = ['+', '-', '*', '/'];
    const functions = ['sin', 'cos'];
    
    const generateTerm = () => {
      const term = terms[Math.floor(Math.random() * terms.length)];
      const coefficient = Math.floor(Math.random() * 9) + 1; // Random integer between 1 and 9
      const power = Math.floor(Math.random() * 5) + 1; // Random integer between 1 and 3
      if (coefficient === 1) {
        return power === 1 ? term : `${term}^${power}`;
      }
      return power === 1 ? `${coefficient}*${term}` : `${coefficient}*${term}^${power}`;
    };
    
    const generateExpression = () => {
      const numTerms = Math.floor(Math.random() * 2) + 2; // 2 to 3 terms
      let expr = [];
      
      for (let i = 0; i < numTerms; i++) {
        let term = generateTerm();
        
        // Randomly wrap term in a function
        if (Math.random() < 0.3) {
          const func = functions[Math.floor(Math.random() * functions.length)];
          term = `${func}(${term})`;
        }
        
        // For terms after the first, randomly make them negative
        if (i > 0 && Math.random() < 0.5) {
          expr.push('-');
          expr.push(term);
        } else {
          if (i > 0) expr.push('+');
          expr.push(term);
        }
      }
      
      return expr.join(' ');
    };
    
    setDx(generateExpression());
    setDy(generateExpression());
  };
  const currentColorScheme = colorSchemes[colorScheme] || colorSchemes.rainbow;

  return (
    <div className="App">
      <div className="controls">
        <div>
          <label>dx/dt: </label>
          <input value={dx} onChange={(e) => setDx(e.target.value)} />
        </div>
        <div>
          <label>dy/dt: </label>
          <input value={dy} onChange={(e) => setDy(e.target.value)} />
        </div>
        <div>
          <label>X Range: </label>
          <input type="number" value={xMin} onChange={(e) => setXMin(Number(e.target.value))} />
          <input type="number" value={xMax} onChange={(e) => setXMax(Number(e.target.value))} />
        </div>
        <div>
          <label>Y Range: </label>
          <input type="number" value={yMin} onChange={(e) => setYMin(Number(e.target.value))} />
          <input type="number" value={yMax} onChange={(e) => setYMax(Number(e.target.value))} />
        </div>
        <div>
          <label>a: </label>
          <input 
            type="text"
            value={a}
            onChange={handleParameterChange(setA)}
            style={{width: '60px'}}
          />
        </div>
        <div>
          <label>b: </label>
          <input 
            type="text"
            value={b}
            onChange={handleParameterChange(setB)}
            style={{width: '60px'}}
          />
        </div>
        <div>
          <label>Color Scheme: </label>
          <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
            {Object.keys(colorSchemes).map(scheme => (
              <option key={scheme} value={scheme}>{colorSchemes[scheme].name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Background Color: </label>
          <input 
            type="color" 
            value={backgroundColor} 
            onChange={(e) => setBackgroundColor(e.target.value)} 
          />
        </div>
        <div>
        <label> Trace Mode:</label>
          <input
            type="checkbox"
            checked={traceMode}
            onChange={(e) => setTraceMode(e.target.checked)}
          />
      </div>
      </div>
      <VectorFieldVisualization
        dx={dx}
        dy={dy}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        a={parseFloat(a) || 0}
        b={parseFloat(b) || 0}
        colorScheme={currentColorScheme}
        backgroundColor={backgroundColor}
        onGenerateRandomSystem={generateRandomEquation}
        traceMode={traceMode}
      />
    </div>
  );
}

export default App;