/**
 * Unit Tests for Main Initialization Module
 * 
 * Comprehensive test suite validating game initialization logic, canvas setup,
 * feature flag handling, error recovery, and browser compatibility checks.
 * 
 * @module main.test
 */

import { init, isFeatureEnabled, isCanvasSupported } from './main.js';
import Game from './game/Game.js';

// Mock the Game class
jest.mock('./game/Game.js');

/**
 * Test suite for main initialization module
 * Validates all initialization paths, error conditions, and feature flag behavior
 */
describe('Main Initialization', () => {
  let mockCanvas;
  let mockContext;
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  /**
   * Setup before each test
   * Creates fresh DOM elements and mocks for isolated testing
   */
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    resetMockTime();
    localStorage.clear();

    // Create mock canvas element
    mockCanvas = document.createElement('canvas');
    mockCanvas.id = 'gameCanvas';
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    // Create mock 2D context
    mockContext = {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      setTransform: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      canvas: mockCanvas,
    };

    // Mock getContext to return our mock context
    mockCanvas.getContext = jest.fn((contextType) => {
      if (contextType === '2d') {
        return mockContext;
      }
      return null;
    });

    // Create game status element
    const statusElement = document.createElement('div');
    statusElement.id = 'gameStatus';
    statusElement.style.display = 'none';

    // Clear document body and add elements
    document.body.innerHTML = '';
    document.body.appendChild(mockCanvas);
    document.body.appendChild(statusElement);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock Game constructor
    Game.mockImplementation((canvas, context) => {
      return {
        id: 'test-game-instance',
        canvas,
        context,
        start: jest.fn(),
        stop: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
      };
    });

    // Mock performance.mark and performance.measure
    window.performance.mark = jest.fn();
    window.performance.measure = jest.fn();
  });

  /**
   * Cleanup after each test
   * Restores spies and clears DOM
   */
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    document.body.innerHTML = '';
  });

  /**
   * Test: Canvas element exists in DOM
   */
  describe('Canvas Element Validation', () => {
    test('should find canvas element in DOM', async () => {
      const game = await init();

      expect(game).not.toBeNull();
      expect(document.getElementById('gameCanvas')).toBe(mockCanvas);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting game initialization')
      );
    });

    test('should fail when canvas element is missing', async () => {
      document.body.removeChild(mockCanvas);

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Game canvas element not found in DOM')
      );

      const statusElement = document.getElementById('gameStatus');
      expect(statusElement.textContent).toContain('Failed to initialize game');
      expect(statusElement.style.display).toBe('block');
    });

    test('should fail when element with gameCanvas id is not a canvas', async () => {
      document.body.removeChild(mockCanvas);
      const divElement = document.createElement('div');
      divElement.id = 'gameCanvas';
      document.body.appendChild(divElement);

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('is not a canvas')
      );
    });
  });

  /**
   * Test: 2D context is created
   */
  describe('2D Context Creation', () => {
    test('should successfully create 2D rendering context', async () => {
      const game = await init();

      expect(game).not.toBeNull();
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Canvas and context initialized successfully')
      );
    });

    test('should fail when getContext returns null', async () => {
      mockCanvas.getContext = jest.fn(() => null);

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to get 2D rendering context')
      );

      const statusElement = document.getElementById('gameStatus');
      expect(statusElement.textContent).toContain('Failed to initialize game graphics');
    });

    test('should fail when context does not support fillRect', async () => {
      const invalidContext = { ...mockContext };
      delete invalidContext.fillRect;
      mockCanvas.getContext = jest.fn(() => invalidContext);

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not support required operations')
      );
    });
  });

  /**
   * Test: Game instance is initialized
   */
  describe('Game Instance Initialization', () => {
    test('should create Game instance with canvas and context', async () => {
      const game = await init();

      expect(game).not.toBeNull();
      expect(Game).toHaveBeenCalledWith(mockCanvas, mockContext);
      expect(Game).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Game instance created successfully')
      );
    });

    test('should log game instance ID when available', async () => {
      const game = await init();

      expect(game).not.toBeNull();
      expect(game.id).toBe('test-game-instance');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-game-instance')
      );
    });

    test('should handle Game constructor throwing error', async () => {
      Game.mockImplementation(() => {
        throw new Error('Game initialization failed');
      });

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create Game instance')
      );

      const statusElement = document.getElementById('gameStatus');
      expect(statusElement.textContent).toContain('Failed to initialize game');
    });

    test('should log initialization completion with timing', async () => {
      advanceMockTime(150);

      const game = await init();

      expect(game).not.toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Game initialization completed successfully')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('initTimeMs')
      );
    });

    test('should mark performance metrics', async () => {
      await init();

      expect(window.performance.mark).toHaveBeenCalledWith('game-init-complete');
      expect(window.performance.measure).toHaveBeenCalledWith(
        'game-init',
        'game-init-complete'
      );
    });
  });

  /**
   * Test: Error handling when canvas not supported
   */
  describe('Canvas Support Detection', () => {
    test('should detect canvas support correctly', () => {
      const supported = isCanvasSupported();
      expect(supported).toBe(true);
    });

    test('should handle browser without canvas support', async () => {
      // Mock createElement to return element without getContext
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return {};
        }
        return originalCreateElement.call(document, tagName);
      });

      const supported = isCanvasSupported();
      expect(supported).toBe(false);

      document.createElement = originalCreateElement;
    });

    test('should display error message when canvas not supported', async () => {
      // Mock isCanvasSupported to return false
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return {};
        }
        return document.createElement(tagName);
      });

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Canvas not supported')
      );

      const statusElement = document.getElementById('gameStatus');
      expect(statusElement.textContent).toContain('HTML5 Canvas is not supported');
      expect(statusElement.style.color).toBe('rgb(255, 68, 68)');
    });
  });

  /**
   * Test: Feature flag check for ENABLE_GAME_CANVAS
   */
  describe('Feature Flag Handling', () => {
    test('should enable game when feature flag is not set (default)', () => {
      const enabled = isFeatureEnabled();
      expect(enabled).toBe(true);
    });

    test('should enable game when feature flag is explicitly true', () => {
      localStorage.setItem('ENABLE_GAME_CANVAS', 'true');
      const enabled = isFeatureEnabled();
      expect(enabled).toBe(true);
    });

    test('should disable game when feature flag is false', () => {
      localStorage.setItem('ENABLE_GAME_CANVAS', 'false');
      const enabled = isFeatureEnabled();
      expect(enabled).toBe(false);
    });

    test('should disable game when feature flag is 0', () => {
      localStorage.setItem('ENABLE_GAME_CANVAS', '0');
      const enabled = isFeatureEnabled();
      expect(enabled).toBe(false);
    });

    test('should enable game for any truthy value', () => {
      localStorage.setItem('ENABLE_GAME_CANVAS', '1');
      expect(isFeatureEnabled()).toBe(true);

      localStorage.setItem('ENABLE_GAME_CANVAS', 'yes');
      expect(isFeatureEnabled()).toBe(true);
    });

    test('should not initialize game when feature flag is disabled', async () => {
      localStorage.setItem('ENABLE_GAME_CANVAS', 'false');

      const game = await init();

      expect(game).toBeNull();
      expect(Game).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Game canvas feature is disabled')
      );
    });

    test('should display feature disabled message', async () => {
      localStorage.setItem('ENABLE_GAME_CANVAS', 'false');

      await init();

      const statusElement = document.getElementById('gameStatus');
      expect(statusElement.textContent).toContain('Game canvas is currently disabled');
      expect(statusElement.textContent).toContain('ENABLE_GAME_CANVAS=true');
      expect(statusElement.style.color).toBe('rgb(255, 170, 0)');
      expect(statusElement.getAttribute('role')).toBe('status');
    });

    test('should handle localStorage access error gracefully', () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage access denied');
      });

      const enabled = isFeatureEnabled();

      expect(enabled).toBe(true); // Default to enabled on error
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read feature flag')
      );

      localStorage.getItem = originalGetItem;
    });
  });

  /**
   * Test: Initialization logs are called
   */
  describe('Logging and Observability', () => {
    test('should log initialization start with context', async () => {
      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting game initialization')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('correlationId')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('userAgent')
      );
    });

    test('should log canvas dimensions', async () => {
      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('canvasWidth')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('canvasHeight')
      );
    });

    test('should log errors with correlation ID and stack trace', async () => {
      Game.mockImplementation(() => {
        throw new Error('Test error');
      });

      await init();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('correlationId')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('stack')
      );
    });

    test('should log initialization time on success', async () => {
      advanceMockTime(100);

      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('initTimeMs')
      );
    });

    test('should log initialization time on failure', async () => {
      document.body.removeChild(mockCanvas);
      advanceMockTime(50);

      await init();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('initTimeMs')
      );
    });

    test('should use structured JSON logging format', async () => {
      await init();

      const logCalls = consoleLogSpy.mock.calls;
      expect(logCalls.length).toBeGreaterThan(0);

      logCalls.forEach((call) => {
        const logMessage = call[0];
        expect(() => JSON.parse(logMessage)).not.toThrow();

        const parsed = JSON.parse(logMessage);
        expect(parsed).toHaveProperty('level');
        expect(parsed).toHaveProperty('timestamp');
        expect(parsed).toHaveProperty('message');
      });
    });

    test('should include screen dimensions in initialization log', async () => {
      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('screenWidth')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('screenHeight')
      );
    });
  });

  /**
   * Test: Error recovery and user feedback
   */
  describe('Error Recovery and User Feedback', () => {
    test('should display user-friendly error message on canvas missing', async () => {
      document.body.removeChild(mockCanvas);

      await init();

      const statusElement = document.getElementById('gameStatus');
      expect(statusElement.textContent).toBe(
        'Failed to initialize game. Please refresh the page.'
      );
      expect(statusElement.style.display).toBe('block');
      expect(statusElement.getAttribute('role')).toBe('alert');
    });

    test('should handle missing status element gracefully', async () => {
      const statusElement = document.getElementById('gameStatus');
      document.body.removeChild(statusElement);
      document.body.removeChild(mockCanvas);

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      // Should not throw error when status element is missing
    });

    test('should catch and log unhandled errors', async () => {
      Game.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const game = await init();

      expect(game).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Game initialization failed')
      );
    });

    test('should return null on all error conditions', async () => {
      // Test various error conditions
      const errorConditions = [
        () => {
          document.body.removeChild(mockCanvas);
        },
        () => {
          mockCanvas.getContext = jest.fn(() => null);
        },
        () => {
          Game.mockImplementation(() => {
            throw new Error('Error');
          });
        },
      ];

      for (const setupError of errorConditions) {
        // Reset
        beforeEach();
        setupError();

        const game = await init();
        expect(game).toBeNull();
      }
    });
  });

  /**
   * Test: Edge cases and boundary conditions
   */
  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle canvas with zero dimensions', async () => {
      mockCanvas.width = 0;
      mockCanvas.height = 0;

      const game = await init();

      // Should still initialize but log dimensions
      expect(game).not.toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('"canvasWidth":0')
      );
    });

    test('should handle very large canvas dimensions', async () => {
      mockCanvas.width = 10000;
      mockCanvas.height = 10000;

      const game = await init();

      expect(game).not.toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('"canvasWidth":10000')
      );
    });

    test('should handle rapid successive initialization calls', async () => {
      const promises = [init(), init(), init()];
      const results = await Promise.all(promises);

      results.forEach((game) => {
        expect(game).not.toBeNull();
      });

      expect(Game).toHaveBeenCalledTimes(3);
    });

    test('should handle initialization with modified global objects', async () => {
      const originalNavigator = global.navigator;
      global.navigator = { userAgent: 'Test Browser' };

      const game = await init();

      expect(game).not.toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test Browser')
      );

      global.navigator = originalNavigator;
    });
  });
});