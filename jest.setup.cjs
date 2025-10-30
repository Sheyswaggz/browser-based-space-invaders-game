/**
 * Jest Setup Configuration for Space Invaders Game
 * 
 * Production-grade test environment setup that configures DOM testing utilities,
 * custom matchers, and browser API mocks for comprehensive game testing.
 * 
 * This setup file runs after the test environment is initialized but before
 * tests are executed, providing a consistent testing foundation across all
 * test suites.
 * 
 * @module jest.setup
 * @requires @testing-library/jest-dom
 */

// Import custom matchers from @testing-library/jest-dom
// Provides enhanced DOM assertions like toBeInTheDocument, toHaveClass, etc.
require('@testing-library/jest-dom');

/**
 * Global test timeout configuration
 * Sets default timeout to 5000ms for all tests to handle async game operations
 * Individual tests can override this with jest.setTimeout() if needed
 */
jest.setTimeout(5000);

/**
 * Mock requestAnimationFrame for deterministic game loop testing
 * 
 * Browser's requestAnimationFrame is non-deterministic and timing-dependent.
 * This mock provides controlled frame timing for predictable test execution.
 * 
 * @param {Function} callback - Function to execute on next frame
 * @returns {number} Frame request ID for cancellation
 */
let rafId = 0;
const rafCallbacks = new Map();

global.requestAnimationFrame = jest.fn((callback) => {
  if (typeof callback !== 'function') {
    throw new TypeError('requestAnimationFrame callback must be a function');
  }
  
  const id = ++rafId;
  rafCallbacks.set(id, callback);
  
  // Execute callback asynchronously to simulate browser behavior
  process.nextTick(() => {
    if (rafCallbacks.has(id)) {
      const cb = rafCallbacks.get(id);
      rafCallbacks.delete(id);
      try {
        cb(performance.now());
      } catch (error) {
        // Log error but don't throw to match browser behavior
        console.error('Error in requestAnimationFrame callback:', error);
      }
    }
  });
  
  return id;
});

/**
 * Mock cancelAnimationFrame for cleaning up animation frames
 * 
 * Allows tests to cancel pending animation frames, preventing memory leaks
 * and ensuring proper cleanup between tests.
 * 
 * @param {number} id - Frame request ID to cancel
 */
global.cancelAnimationFrame = jest.fn((id) => {
  if (typeof id === 'number' && rafCallbacks.has(id)) {
    rafCallbacks.delete(id);
  }
});

/**
 * Mock HTMLCanvasElement.prototype.getContext for canvas testing
 * 
 * Provides a comprehensive mock of the 2D rendering context with all
 * commonly used methods and properties for game rendering tests.
 */
const mockContext2D = {
  // Canvas state management
  save: jest.fn(),
  restore: jest.fn(),
  
  // Transformations
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  setTransform: jest.fn(),
  resetTransform: jest.fn(),
  
  // Drawing rectangles
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  
  // Drawing paths
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  ellipse: jest.fn(),
  rect: jest.fn(),
  
  // Path drawing
  fill: jest.fn(),
  stroke: jest.fn(),
  clip: jest.fn(),
  
  // Text rendering
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  
  // Drawing images
  drawImage: jest.fn(),
  
  // Pixel manipulation
  createImageData: jest.fn(() => ({ data: [], width: 0, height: 0 })),
  getImageData: jest.fn(() => ({ data: [], width: 0, height: 0 })),
  putImageData: jest.fn(),
  
  // Compositing
  globalAlpha: 1.0,
  globalCompositeOperation: 'source-over',
  
  // Line styles
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  setLineDash: jest.fn(),
  getLineDash: jest.fn(() => []),
  lineDashOffset: 0,
  
  // Fill and stroke styles
  fillStyle: '#000000',
  strokeStyle: '#000000',
  
  // Gradients and patterns
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createPattern: jest.fn(() => ({})),
  
  // Shadows
  shadowBlur: 0,
  shadowColor: 'transparent',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  
  // Text styles
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'ltr',
  
  // Image smoothing
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  
  // Canvas dimensions (will be set by canvas mock)
  canvas: null,
};

/**
 * Mock canvas element with proper dimensions and context
 */
const createMockCanvas = () => {
  const canvas = document.createElement('canvas');
  
  // Set default dimensions
  canvas.width = 800;
  canvas.height = 600;
  
  // Override getContext to return our mock
  const originalGetContext = canvas.getContext.bind(canvas);
  canvas.getContext = jest.fn((contextType, options) => {
    if (contextType === '2d') {
      // Create a fresh mock context for each call
      const context = { ...mockContext2D };
      context.canvas = canvas;
      return context;
    }
    // Fall back to original implementation for other context types
    return originalGetContext(contextType, options);
  });
  
  return canvas;
};

// Override document.createElement for canvas elements
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName, options) => {
  if (tagName.toLowerCase() === 'canvas') {
    return createMockCanvas();
  }
  return originalCreateElement(tagName, options);
});

/**
 * Mock performance.now() for consistent timing in tests
 * Provides deterministic timestamps for game loop and animation testing
 */
let mockTime = 0;
const originalPerformanceNow = performance.now.bind(performance);

performance.now = jest.fn(() => mockTime);

/**
 * Helper function to advance mock time
 * Useful for testing time-dependent game logic
 * 
 * @param {number} ms - Milliseconds to advance
 */
global.advanceMockTime = (ms) => {
  if (typeof ms !== 'number' || ms < 0) {
    throw new TypeError('advanceMockTime requires a non-negative number');
  }
  mockTime += ms;
};

/**
 * Helper function to reset mock time
 * Should be called in beforeEach or afterEach to ensure test isolation
 */
global.resetMockTime = () => {
  mockTime = 0;
};

/**
 * Mock localStorage for game state persistence testing
 * Provides in-memory storage that behaves like browser localStorage
 */
const localStorageMock = (() => {
  let store = {};
  
  return {
    getItem: jest.fn((key) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

global.localStorage = localStorageMock;

/**
 * Mock Audio API for sound effect testing
 * Prevents actual audio playback during tests while maintaining API compatibility
 */
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  volume: 1.0,
  muted: false,
  currentTime: 0,
  duration: 0,
  paused: true,
  ended: false,
  readyState: 4, // HAVE_ENOUGH_DATA
}));

/**
 * Mock Image constructor for sprite loading tests
 * Simulates image loading without actual network requests
 */
const ImageMock = jest.fn().mockImplementation(() => {
  const img = {
    addEventListener: jest.fn((event, handler) => {
      if (event === 'load') {
        // Simulate successful image load asynchronously
        process.nextTick(() => handler());
      }
    }),
    removeEventListener: jest.fn(),
    src: '',
    width: 0,
    height: 0,
    complete: false,
    naturalWidth: 0,
    naturalHeight: 0,
  };
  
  // Simulate image properties being set when src is assigned
  Object.defineProperty(img, 'src', {
    get() {
      return this._src || '';
    },
    set(value) {
      this._src = value;
      // Simulate image loading
      process.nextTick(() => {
        img.complete = true;
        img.width = 100;
        img.height = 100;
        img.naturalWidth = 100;
        img.naturalHeight = 100;
      });
    },
  });
  
  return img;
});

global.Image = ImageMock;

/**
 * Cleanup function to reset all mocks between tests
 * Ensures test isolation and prevents state leakage
 */
afterEach(() => {
  // Clear all mock function calls
  jest.clearAllMocks();
  
  // Reset animation frame callbacks
  rafCallbacks.clear();
  rafId = 0;
  
  // Reset mock time
  resetMockTime();
  
  // Clear localStorage
  localStorageMock.clear();
  
  // Reset canvas context mock state
  Object.keys(mockContext2D).forEach((key) => {
    if (typeof mockContext2D[key] === 'function' && mockContext2D[key].mockClear) {
      mockContext2D[key].mockClear();
    }
  });
});

/**
 * Global error handler for unhandled promise rejections
 * Ensures test failures for unhandled async errors
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection in test:', reason);
  throw reason;
});

/**
 * Console error spy for detecting unexpected errors during tests
 * Helps identify issues that might not cause test failures but indicate problems
 */
const originalConsoleError = console.error;
console.error = jest.fn((...args) => {
  // Filter out known React/testing-library warnings
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render') ||
     message.includes('Not implemented: HTMLFormElement.prototype.submit'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
});

/**
 * Custom matcher for canvas context method calls
 * Provides better assertions for canvas rendering tests
 */
expect.extend({
  toHaveBeenCalledOnCanvas(received, methodName, ...expectedArgs) {
    const pass = received[methodName] && 
                 received[methodName].mock &&
                 received[methodName].mock.calls.length > 0 &&
                 (expectedArgs.length === 0 || 
                  received[methodName].mock.calls.some(call => 
                    expectedArgs.every((arg, i) => call[i] === arg)
                  ));
    
    return {
      pass,
      message: () => 
        pass
          ? `expected ${methodName} not to have been called on canvas context`
          : `expected ${methodName} to have been called on canvas context${
              expectedArgs.length > 0 ? ` with args ${JSON.stringify(expectedArgs)}` : ''
            }`,
    };
  },
});

// Log setup completion for debugging
if (process.env.DEBUG_TESTS) {
  console.log('Jest setup completed successfully');
  console.log('- Custom matchers loaded');
  console.log('- Canvas API mocked');
  console.log('- Animation frame API mocked');
  console.log('- Performance timing mocked');
  console.log('- Storage API mocked');
  console.log('- Audio API mocked');
  console.log('- Image loading mocked');
}