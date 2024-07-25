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
  const [a, setA] = useState(4);
  const [b, setB] = useState(1.5);
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [backgroundColor, setBackgroundColor] = useState('#000014');
  const [traceMode, setTraceMode] = useState(false);

  const generateRandomEquation = () => {
    const terms = ['a', 'b', 'x*y'];
    const functions = ['sin', 'cos'];
    
    const generateTerm = (variable) => {
      if (variable === 'x*y') return variable; // Don't modify the interaction term
      const coefficient = Math.floor(Math.random() * 9) + 1; // Random integer between 1 and 9
      const power = Math.floor(Math.random() * 3) + 1; // Random integer between 1 and 3
      if (coefficient === 1) {
        return power === 1 ? variable : `${variable}^${power}`;
      }
      return power === 1 ? `${coefficient}*${variable}` : `${coefficient}*${variable}^${power}`;
    };
    
    const generateExpression = () => {
      let expr = [generateTerm('x'), generateTerm('y')];
      
      // Add 1-3 additional terms
      const additionalTerms = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < additionalTerms; i++) {
        const term = generateTerm(terms[Math.floor(Math.random() * terms.length)]);
        expr.push(term);
      }
      
      // Randomly apply functions and make terms negative
      expr = expr.map(term => {
        if (Math.random() < 0.3 && term !== 'x*y') {
          const func = functions[Math.floor(Math.random() * functions.length)];
          term = `${func}(${term})`;
        }
        return Math.random() < 0.5 ? `-${term}` : term;
      });
      
      return expr.join(' + ').replace(/\+ -/g, '- ');
    };
    
    setDx(generateExpression());
    setDy(generateExpression());
    
    // Set 'a' to -1 and 'b' to 1
    setA(-1);
    setB(1);
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
          <label>a: {a.toFixed(1)}</label>
          <input 
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            style={{width: '200px'}}
          />
        </div>
        <div>
          <label>b: {b.toFixed(1)}</label>
          <input 
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            style={{width: '200px'}}
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
        a={a}
        b={b}
        colorScheme={currentColorScheme}
        backgroundColor={backgroundColor}
        onGenerateRandomSystem={generateRandomEquation}
        traceMode={traceMode}
      />
    </div>
  );
}

export default App;