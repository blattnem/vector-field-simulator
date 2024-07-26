import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

const VectorFieldVisualization = ({ dx, dy, xMin, xMax, yMin, yMax, a, b, colorScheme, backgroundColor = '#000000', onGenerateRandomSystem, traceMode }) => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const isMounted = useRef(true);
  const particlesRef = useRef([]);
  const tracedParticlesRef = useRef([]);

  useEffect(() => {
    if (traceMode) {
      tracedParticlesRef.current = Array(20).fill().map(() => ({
        x: xMin + Math.random() * (xMax - xMin),
        y: yMin + Math.random() * (yMax - yMin),
        history: []
      }));
    } else {
      tracedParticlesRef.current = [];
    }
  }, [traceMode, xMin, xMax, yMin, yMax]);

  const safeSetError = useCallback((errorMessage) => {
    if (isMounted.current) {
      setError(errorMessage);
    }
  }, []);

  const updateCanvasSize = useCallback(() => {
    const padding = 15;
    const newWidth = window.innerWidth - padding * 2;
    const newHeight = window.innerHeight - 80;

    setCanvasSize({ width: newWidth, height: newHeight });
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const evaluateExpression = useMemo(() => {
    return (expr, x, y, a, b) => {
      try {
        const cleanExpr = expr.trim().replace(/;+$/, '');
        
        if (cleanExpr === '') {
          throw new Error('Empty expression');
        }
        
        const parse = (str) => {
          const tokens = str.match(/(\d+\.?\d*|\+|\-|\*|\/|\(|\)|\^|[a-zA-Z]+)/g) || [];
          let pos = 0;
          
          const parseExpression = () => {
            if (pos >= tokens.length) {
              throw new Error('Unexpected end of expression');
            }
            let left = parseTerm();
            while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
              const op = tokens[pos++];
              const right = parseTerm();
              left = op === '+' ? left + right : left - right;
            }
            return left;
          };
          
          const parseTerm = () => {
            let left = parseFactor();
            while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
              const op = tokens[pos++];
              const right = parseFactor();
              left = op === '*' ? left * right : left / right;
            }
            return left;
          };
          
          const parseFactor = () => {
            if (pos >= tokens.length) {
              throw new Error('Unexpected end of expression');
            }
            let left = parseBase();
            if (pos < tokens.length && tokens[pos] === '^') {
              pos++;
              const right = parseFactor();
              return Math.pow(left, right);
            }
            return left;
          };
          
          const parseBase = () => {
            if (tokens[pos] === '(') {
              pos++;
              const result = parseExpression();
              if (pos < tokens.length && tokens[pos] === ')') {
                pos++;
              } else {
                throw new Error('Mismatched parentheses');
              }
              return result;
            }
            if (tokens[pos] === '-') {
              pos++;
              return -parseFactor();
            }
            if (isNaN(tokens[pos])) {
              const token = tokens[pos++];
              if (token === 'x') return x;
              if (token === 'y') return y;
              if (token === 'a') return a;
              if (token === 'b') return b;
              if (token === 'sin') return Math.sin(parseFactor());
              if (token === 'cos') return Math.cos(parseFactor());
              if (token === 'tan') return Math.tan(parseFactor());
              if (token === 'exp') return Math.exp(parseFactor());
              if (token === 'sqrt') return Math.sqrt(parseFactor());
              throw new Error(`Unknown token: ${token}`);
            }
            return parseFloat(tokens[pos++]);
          };
          
          const result = parseExpression();
          if (pos < tokens.length) {
            throw new Error(`Unexpected token: ${tokens[pos]}`);
          }
          return result;
        };
        
        const result = parse(cleanExpr);
        
        if (typeof result !== 'number' || !isFinite(result)) {
          throw new Error('Expression did not evaluate to a finite number');
        }
        
        return result;
      } catch (err) {
        console.error("Error evaluating expression:", err);
        safeSetError(`Invalid expression: ${expr}. Error: ${err.message}`);
        return 0;
      }
    };
  }, [safeSetError]);

  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;

    safeSetError(null);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSize;

    canvas.width = width;
    canvas.height = height;

    const particleCount = 8000;
    const maxAge = 300;
    const fadeInDuration = 30;
    const fadeOutDuration = 30;
    const maxVisibleAge = maxAge - fadeOutDuration;
    const dt = 0.01;

    // Initialize particles if they don't exist
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: xMin + Math.random() * (xMax - xMin),
          y: yMin + Math.random() * (yMax - yMin),
          age: Math.random() * maxAge,
          fadeInAge: Math.floor(Math.random() * fadeInDuration)
        });
      }
    }

    let animationFrameId;
    let frame = 0;

    function animate() {
      if (!isMounted.current) return;
    
      ctx.fillStyle = `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(backgroundColor.slice(3, 5), 16)}, ${parseInt(backgroundColor.slice(5, 7), 16)}, 0.1)`;
      ctx.fillRect(0, 0, width, height);
    
      let successfulEvaluation = false;
    
      // Mutable update function
      const updateParticle = (particle) => {
        let vx, vy;
        try {
          vx = evaluateExpression(dx, particle.x, particle.y, a, b);
          vy = evaluateExpression(dy, particle.x, particle.y, a, b);
          if (isFinite(vx) && isFinite(vy)) {
            successfulEvaluation = true;
          } else {
            return particle;
          }
        } catch (err) {
          return particle;
        }
    
        const magnitude = Math.sqrt(vx * vx + vy * vy);
        const scaleFactor = 2 / (1 + magnitude);
        
        particle.x += vx * scaleFactor * dt;
        particle.y += vy * scaleFactor * dt;
        particle.age += 1;
    
        // Calculate alpha based on particle age
        let alpha;
        if (particle.age <= particle.fadeInAge) {
          alpha = particle.age / particle.fadeInAge;
        } else if (particle.age > maxVisibleAge) {
          alpha = (maxAge - particle.age) / fadeOutDuration;
        } else {
          alpha = 1;
        }
    
        // Smooth transition for particles leaving the system bounds
        if (particle.x < xMin || particle.x > xMax || particle.y < yMin || particle.y > yMax) {
          alpha *= 0.95;
        }
    
        alpha = Math.max(0, Math.min(1, alpha));
    
        const canvasX = ((particle.x - xMin) / (xMax - xMin)) * width;
        const canvasY = height - ((particle.y - yMin) / (yMax - yMin)) * height;
    
        const color = colorScheme.getColor(Math.atan2(vy, vx), alpha, magnitude);
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 1.5, 0, Math.PI * 1.5);
        ctx.fillStyle = color;
        ctx.fill();
    
        const gradient = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, 4);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(canvasX - 4, canvasY - 4, 8, 8);
    
        // Stagger particle reinitialization
        if (particle.age > maxAge || alpha <= 0.01) {
          if (frame % 10 === particlesRef.current.indexOf(particle) % 10) { // Reinitialize only a subset of particles each frame
            particle.x = xMin + Math.random() * (xMax - xMin);
            particle.y = yMin + Math.random() * (yMax - yMin);
            particle.age = 0;
            particle.fadeInAge = Math.floor(Math.random() * fadeInDuration);
          }
        }

        return particle;
      };

      // Update particles mutably
      particlesRef.current = particlesRef.current.map(updateParticle);
    
      // Handle traced particles
      if (traceMode) {
        tracedParticlesRef.current = tracedParticlesRef.current.map(particle => {
          let vx, vy;
          try {
            vx = evaluateExpression(dx, particle.x, particle.y, a, b);
            vy = evaluateExpression(dy, particle.x, particle.y, a, b);
          } catch (err) {
            return particle;
          }

          const magnitude = Math.sqrt(vx * vx + vy * vy);
          const scaleFactor = 2 / (1 + magnitude);
          
          const newX = particle.x + vx * scaleFactor * dt;
          const newY = particle.y + vy * scaleFactor * dt;

          const canvasX = ((newX - xMin) / (xMax - xMin)) * width;
          const canvasY = height - ((newY - yMin) / (yMax - yMin)) * height;

          return {
            x: newX,
            y: newY,
            history: [...particle.history, {x: canvasX, y: canvasY}].slice(-100)  // Keep last 100 points
          };
        });

        // Render traced particles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        tracedParticlesRef.current.forEach(particle => {
          if (particle.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(particle.history[0].x, particle.history[0].y);
            particle.history.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
        });
      }
    
      if (successfulEvaluation) {
        safeSetError(null);
      } else {
        console.log(`No successful evaluations. dx="${dx}", dy="${dy}", a=${a}, b=${b}`);
        safeSetError("No valid particles. Check your equations.");
      }
    
      frame++;
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dx, dy, xMin, xMax, yMin, yMax, a, b, canvasSize, evaluateExpression, colorScheme, backgroundColor, safeSetError, traceMode]);

  const clearTraces = () => {
    tracedParticlesRef.current = [];
  };

  return (
    <div className="canvas-container" style={{ 
      position: 'relative', 
      width: canvasSize.width, 
      height: canvasSize.height, 
      backgroundColor: backgroundColor || '#000000'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      {error && <div style={{ color: 'red', marginTop: '10px', position: 'absolute', top: '100%' }}>{error}</div>}
      <button 
        onClick={onGenerateRandomSystem}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px',
          backgroundColor: '#4c5caf',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Generate Random System
      </button>
      {traceMode && (
        <button 
          onClick={clearTraces}
          style={{
            position: 'absolute',
            top: '10px',
            right: '200px',
            padding: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Traces
        </button>
      )}
    </div>
  );
};

export default VectorFieldVisualization;