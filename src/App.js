import React, { useState, useEffect } from 'react';
import VectorFieldVisualization from './components/VectorFieldVisualization';
import PhasePortrait from './components/PhasePortrait';
import ReactMarkdown from 'react-markdown';
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

const predefinedSystems = {
  custom: { 
    name: 'Custom', 
    dx: 'a*x*(1-x)*(x-1) -y + 2.1', 
    dy: 'b*y*(1-y)*(1-x)', 
    a: 4, 
    b: 1.5,
    description: 'Create your own system or use the random generator.'
  },
  lotkaVolterra: { 
    name: 'Lotka-Volterra', 
    dx: 'a*x - b*x*y', 
    dy: '-y + x*y', 
    a: 1, 
    b: 1,
    description: 'Models predator-prey interactions in ecological systems.'
  },
  vanDerPol: { 
    name: 'Van der Pol', 
    dx: 'y', 
    dy: 'a*(1 - x^2)*y - x', 
    a: 1, 
    b: 0,
    description: 'Describes oscillations with nonlinear damping.'
  },
  duffing: { 
    name: 'Duffing', 
    dx: 'y', 
    dy: '-b*y - a*x - x^3', 
    a: 1, 
    b: 0.3,
    description: 'Models a driven oscillator with a nonlinear elasticity.'
  },
  brusselator: { 
    name: 'Brusselator', 
    dx: 'a + x^2*y - (b+1)*x', 
    dy: 'b*x - x^2*y', 
    a: 1, 
    b: 3,
    description: 'Theoretical model for a type of autocatalytic reaction.'
  },
  fitzhughNagumo: { 
    name: 'FitzHugh-Nagumo', 
    dx: 'x - x^3/3 - y + a', 
    dy: 'b*(x + 0.7 - 0.8*y)', 
    a: 0.7, 
    b: 0.8,
    description: 'Simplified model of action potential in neurons.'
  },
  selkov: { 
    name: 'Selkov', 
    dx: '-x + a*y + x^2*y', 
    dy: 'b - a*y - x^2*y', 
    a: 0.08, 
    b: 0.6,
    description: 'Models glycolysis oscillations in cells.'
  },
  bogdanovTakens: { 
    name: 'Bogdanov-Takens', 
    dx: 'y', 
    dy: 'a + b*x + x^2 + x*y', 
    a: 0.5, 
    b: 0.5,
    description: 'Exhibits various types of bifurcations.'
  },
  vanDerPolDuffing: { 
    name: 'Van der Pol-Duffing', 
    dx: 'y', 
    dy: '-x + a*y - y^3 + b*cos(x)', 
    a: 1, 
    b: 0.3,
    description: 'Combines features of Van der Pol and Duffing oscillators.'
  },
  circleLattice: { 
    name: 'Circle Lattice', 
    dx: 'sin(x) + a*sin(y)', 
    dy: 'sin(y) + b*sin(x)', 
    a: 1, 
    b: 1,
    description: 'Produces interesting circular patterns.'
  },
};

function App() {
  const [dx, setDx] = useState(predefinedSystems.custom.dx);
  const [dy, setDy] = useState(predefinedSystems.custom.dy);
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [a, setA] = useState(predefinedSystems.custom.a);
  const [b, setB] = useState(predefinedSystems.custom.b);
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [backgroundColor, setBackgroundColor] = useState('#000014');
  const [traceMode, setTraceMode] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('custom');
  const [showDocs, setShowDocs] = useState(false);
  const [docContent, setDocContent] = useState('');

  useEffect(() => {
    fetch('/docs/explanation.md')
      .then(response => response.text())
      .then(text => setDocContent(text));
  }, []);

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
    setSelectedSystem('custom');
    
    // Set 'a' to -1 and 'b' to 1
    setA(-1);
    setB(1);
  };

  const handleSystemChange = (e) => {
    const system = predefinedSystems[e.target.value];
    setSelectedSystem(e.target.value);
    setDx(system.dx);
    setDy(system.dy);
    setA(system.a);
    setB(system.b);
  };

  const currentColorScheme = colorSchemes[colorScheme] || colorSchemes.rainbow;

  return (
    <div className="App">
      <div className="controls">
        <div>
          <label>Predefined Systems: </label>
          <select value={selectedSystem} onChange={handleSystemChange}>
            {Object.entries(predefinedSystems).map(([key, system]) => (
              <option key={key} value={key} title={system.description}>
                {system.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>dx/dt: </label>
          <input value={dx} onChange={(e) => {setDx(e.target.value); setSelectedSystem('custom');}} />
        </div>
        <div>
          <label>dy/dt: </label>
          <input value={dy} onChange={(e) => {setDy(e.target.value); setSelectedSystem('custom');}} />
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
            onChange={(e) => {setA(Number(e.target.value)); setSelectedSystem('custom');}}
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
            onChange={(e) => {setB(Number(e.target.value)); setSelectedSystem('custom');}}
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
          <label>Background: </label>
          <input 
            type="color" 
            value={backgroundColor} 
            onChange={(e) => setBackgroundColor(e.target.value)} 
          />
        </div>
        <div className="trace-and-doc">
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={traceMode}
                  onChange={(e) => setTraceMode(e.target.checked)}
                />
                Trace Mode
              </label>
            </div>
            <button className="doc-button small" onClick={() => setShowDocs(!showDocs)}>
              Docs
            </button>
          </div>
        </div>
        {showDocs && (
  <div className="doc-modal">
    <div className="doc-content">
      <button className="close-button" onClick={() => setShowDocs(false)}>×</button>
      <ReactMarkdown>{docContent}</ReactMarkdown>
    </div>
  </div>
)}
      <div className="visualization-container">
        <div className="vector-field-container">
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
        <div className="phase-portrait-container">
          <PhasePortrait
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
          />
        </div>
      </div>
    </div>
  );
}

export default App;