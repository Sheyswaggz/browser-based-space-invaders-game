/**
 * Unit Tests for Game Class
 * 
 * Comprehensive test suite for Game class canvas management and rendering methods.
 * Tests constructor validation, canvas setup, responsive sizing, rendering lifecycle,
 * and resource cleanup with proper mocking and edge case coverage.
 * 
 * @module game/Game.test
 */

import Game from './Game.js';

describe('Game Class', () => {
  let canvas;
  let context;
  let mockWindowInnerWidth;
  let mockWindowInnerHeight;

  /**
   * Setup before each test
   * Creates fresh canvas and context mocks with proper dimensions
   */
  beforeEach(() => {
    // Reset mock time for deterministic tests
    resetMockTime();

    // Create canvas element
    canvas = document.createElement('canvas');
    
    // Get mocked 2D context
    context = canvas.getContext('2d');

    // Store original window dimensions
    mockWindowInnerWidth = window.innerWidth;
    mockWindowInnerHeight = window.innerHeight;

    // Set default window dimensions for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  /**
   * Cleanup after each test
   * Restores window dimensions and clears event listeners
   */
  afterEach(() => {
    // Restore original window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: mockWindowInnerWidth,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: mockWindowInnerHeight,
    });

    // Remove all resize event listeners
    window.removeEventListener('resize', jest.fn());
  });

  describe('Constructor', () => {
    test('should store canvas and context references', () => {
      const game = new Game(canvas, context);

      expect(game.getCanvas()).toBe(canvas);
      expect(game.getContext()).toBe(context);
    });

    test('should throw error when canvas is null', () => {
      expect(() => new Game(null, context)).toThrow('Canvas parameter is required');
    });

    test('should throw error when canvas is undefined', () => {
      expect(() => new Game(undefined, context)).toThrow('Canvas parameter is required');
    });

    test('should throw error when canvas is not HTMLCanvasElement', () => {
      const invalidCanvas = document.createElement('div');
      
      expect(() => new Game(invalidCanvas, context)).toThrow(
        'Canvas must be an HTMLCanvasElement'
      );
    });

    test('should throw error when context is null', () => {
      expect(() => new Game(canvas, null)).toThrow('Context parameter is required');
    });

    test('should throw error when context is undefined', () => {
      expect(() => new Game(canvas, undefined)).toThrow('Context parameter is required');
    });

    test('should throw error when context is invalid', () => {
      const invalidContext = { notFillRect: jest.fn() };
      
      expect(() => new Game(canvas, invalidContext)).toThrow(
        'Context must be a valid CanvasRenderingContext2D with fillRect method'
      );
    });

    test('should generate unique correlation ID', () => {
      const game1 = new Game(canvas, context);
      const canvas2 = document.createElement('canvas');
      const context2 = canvas2.getContext('2d');
      const game2 = new Game(canvas2, context2);

      expect(game1.id).toBeDefined();
      expect(game2.id).toBeDefined();
      expect(game1.id).not.toBe(game2.id);
    });

    test('should call setupCanvas during construction', () => {
      const game = new Game(canvas, context);

      // Verify canvas dimensions were set
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    test('should set _isSetup flag to true after successful construction', () => {
      const game = new Game(canvas, context);

      expect(game._isSetup).toBe(true);
    });
  });

  describe('setupCanvas', () => {
    test('should set canvas dimensions based on window size', () => {
      const game = new Game(canvas, context);

      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    test('should maintain 16:9 aspect ratio', () => {
      const game = new Game(canvas, context);

      const aspectRatio = canvas.width / canvas.height;
      const expectedAspectRatio = 16 / 9;

      // Allow small floating point difference
      expect(Math.abs(aspectRatio - expectedAspectRatio)).toBeLessThan(0.01);
    });

    test('should set CSS dimensions matching canvas dimensions', () => {
      const game = new Game(canvas, context);

      expect(canvas.style.width).toBe(`${canvas.width}px`);
      expect(canvas.style.height).toBe(`${canvas.height}px`);
    });

    test('should handle narrow window (height constrained)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const game = new Game(canvas, context);

      // Should be constrained by width
      expect(canvas.width).toBeLessThanOrEqual(800 - 20);
      
      // Verify aspect ratio maintained
      const aspectRatio = canvas.width / canvas.height;
      expect(Math.abs(aspectRatio - 16 / 9)).toBeLessThan(0.01);
    });

    test('should handle wide window (width constrained)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 2560,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });

      const game = new Game(canvas, context);

      // Should be constrained by height
      expect(canvas.height).toBeLessThanOrEqual(800 - 20);
      
      // Verify aspect ratio maintained
      const aspectRatio = canvas.width / canvas.height;
      expect(Math.abs(aspectRatio - 16 / 9)).toBeLessThan(0.01);
    });

    test('should enforce minimum dimensions', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 200,
      });

      const game = new Game(canvas, context);

      // Minimum width should be 320
      expect(canvas.width).toBeGreaterThanOrEqual(320);
      
      // Verify aspect ratio maintained
      const aspectRatio = canvas.width / canvas.height;
      expect(Math.abs(aspectRatio - 16 / 9)).toBeLessThan(0.01);
    });

    test('should enforce maximum dimensions', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 5000,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 3000,
      });

      const game = new Game(canvas, context);

      // Maximum width should be 1280
      expect(canvas.width).toBeLessThanOrEqual(1280);
      // Maximum height should be 720
      expect(canvas.height).toBeLessThanOrEqual(720);
    });

    test('should ensure dimensions are even numbers', () => {
      const game = new Game(canvas, context);

      expect(canvas.width % 2).toBe(0);
      expect(canvas.height % 2).toBe(0);
    });

    test('should throw error if canvas setup fails', () => {
      // Mock canvas to throw error when setting width
      Object.defineProperty(canvas, 'width', {
        set: () => {
          throw new Error('Canvas width assignment failed');
        },
        get: () => 0,
      });

      expect(() => new Game(canvas, context)).toThrow('Failed to setup canvas');
    });
  });

  describe('Resize Event Listener', () => {
    test('should add resize event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      const game = new Game(canvas, context);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        { passive: true }
      );

      addEventListenerSpy.mockRestore();
    });

    test('should handle resize event with debouncing', (done) => {
      const game = new Game(canvas, context);
      const originalWidth = canvas.width;

      // Change window dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Canvas should not resize immediately (debounced)
      expect(canvas.width).toBe(originalWidth);

      // Wait for debounce timeout (150ms)
      setTimeout(() => {
        // Canvas should be resized after debounce
        expect(canvas.width).not.toBe(originalWidth);
        done();
      }, 200);
    });

    test('should debounce multiple rapid resize events', (done) => {
      const game = new Game(canvas, context);
      const renderSpy = jest.spyOn(game, 'render');

      // Trigger multiple resize events rapidly
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'));
      }

      // Wait for debounce timeout
      setTimeout(() => {
        // Render should only be called once after debounce
        expect(renderSpy).toHaveBeenCalledTimes(1);
        renderSpy.mockRestore();
        done();
      }, 200);
    });

    test('should re-render after resize', (done) => {
      const game = new Game(canvas, context);
      const renderSpy = jest.spyOn(game, 'render');
      renderSpy.mockClear(); // Clear initial render call

      // Trigger resize
      window.dispatchEvent(new Event('resize'));

      setTimeout(() => {
        expect(renderSpy).toHaveBeenCalled();
        renderSpy.mockRestore();
        done();
      }, 200);
    });

    test('should handle resize errors gracefully', (done) => {
      const game = new Game(canvas, context);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock _calculateCanvasDimensions to throw error
      game._calculateCanvasDimensions = jest.fn(() => {
        throw new Error('Calculation failed');
      });

      // Trigger resize
      window.dispatchEvent(new Event('resize'));

      setTimeout(() => {
        // Should log error but not crash
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        done();
      }, 200);
    });
  });

  describe('clearCanvas', () => {
    test('should call context.clearRect with correct dimensions', () => {
      const game = new Game(canvas, context);
      
      game.clearCanvas();

      expect(context.clearRect).toHaveBeenCalledWith(
        0,
        0,
        canvas.width,
        canvas.height
      );
    });

    test('should throw error if clearRect fails', () => {
      const game = new Game(canvas, context);
      
      context.clearRect.mockImplementation(() => {
        throw new Error('clearRect failed');
      });

      expect(() => game.clearCanvas()).toThrow('Failed to clear canvas');
    });

    test('should clear entire canvas area', () => {
      canvas.width = 800;
      canvas.height = 600;
      const game = new Game(canvas, context);

      game.clearCanvas();

      expect(context.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });

  describe('render', () => {
    test('should clear canvas before drawing', () => {
      const game = new Game(canvas, context);
      context.clearRect.mockClear();

      game.render();

      expect(context.clearRect).toHaveBeenCalledWith(
        0,
        0,
        canvas.width,
        canvas.height
      );
    });

    test('should draw test rectangle in center', () => {
      canvas.width = 800;
      canvas.height = 600;
      const game = new Game(canvas, context);
      context.fillRect.mockClear();

      game.render();

      const expectedX = (800 - 100) / 2;
      const expectedY = (600 - 100) / 2;

      expect(context.fillRect).toHaveBeenCalledWith(expectedX, expectedY, 100, 100);
    });

    test('should set fill style before drawing', () => {
      const game = new Game(canvas, context);

      game.render();

      expect(context.fillStyle).toBe('#00ff00');
    });

    test('should draw border around rectangle', () => {
      canvas.width = 800;
      canvas.height = 600;
      const game = new Game(canvas, context);
      context.strokeRect.mockClear();

      game.render();

      const expectedX = (800 - 100) / 2;
      const expectedY = (600 - 100) / 2;

      expect(context.strokeRect).toHaveBeenCalledWith(expectedX, expectedY, 100, 100);
      expect(context.strokeStyle).toBe('#ffffff');
      expect(context.lineWidth).toBe(2);
    });

    test('should throw error if render fails', () => {
      const game = new Game(canvas, context);
      
      context.fillRect.mockImplementation(() => {
        throw new Error('fillRect failed');
      });

      expect(() => game.render()).toThrow('Failed to render');
    });

    test('should handle different canvas dimensions', () => {
      canvas.width = 1280;
      canvas.height = 720;
      const game = new Game(canvas, context);
      context.fillRect.mockClear();

      game.render();

      const expectedX = (1280 - 100) / 2;
      const expectedY = (720 - 100) / 2;

      expect(context.fillRect).toHaveBeenCalledWith(expectedX, expectedY, 100, 100);
    });
  });

  describe('getCanvas', () => {
    test('should return correct canvas reference', () => {
      const game = new Game(canvas, context);

      expect(game.getCanvas()).toBe(canvas);
      expect(game.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
    });
  });

  describe('getContext', () => {
    test('should return correct context reference', () => {
      const game = new Game(canvas, context);

      expect(game.getContext()).toBe(context);
      expect(game.getContext().fillRect).toBeDefined();
    });
  });

  describe('destroy', () => {
    test('should remove resize event listener', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const game = new Game(canvas, context);

      game.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    test('should clear pending resize timeout', (done) => {
      const game = new Game(canvas, context);

      // Trigger resize to create pending timeout
      window.dispatchEvent(new Event('resize'));

      // Destroy immediately
      game.destroy();

      // Wait longer than debounce timeout
      setTimeout(() => {
        // Resize should not have been processed
        expect(game._resizeTimeoutId).toBeNull();
        done();
      }, 200);
    });

    test('should clear canvas on destroy', () => {
      const game = new Game(canvas, context);
      context.clearRect.mockClear();

      game.destroy();

      expect(context.clearRect).toHaveBeenCalledWith(
        0,
        0,
        canvas.width,
        canvas.height
      );
    });

    test('should handle destroy errors gracefully', () => {
      const game = new Game(canvas, context);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      context.clearRect.mockImplementation(() => {
        throw new Error('clearRect failed');
      });

      // Should not throw
      expect(() => game.destroy()).not.toThrow();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Aspect Ratio Maintenance', () => {
    test('should maintain 16:9 aspect ratio on various window sizes', () => {
      const testCases = [
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 1024, height: 768 },
        { width: 800, height: 600 },
        { width: 640, height: 480 },
        { width: 375, height: 667 }, // Mobile portrait
        { width: 667, height: 375 }, // Mobile landscape
      ];

      testCases.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        });

        const testCanvas = document.createElement('canvas');
        const testContext = testCanvas.getContext('2d');
        const game = new Game(testCanvas, testContext);

        const aspectRatio = testCanvas.width / testCanvas.height;
        const expectedAspectRatio = 16 / 9;

        expect(Math.abs(aspectRatio - expectedAspectRatio)).toBeLessThan(0.01);

        game.destroy();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero window dimensions', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const game = new Game(canvas, context);

      // Should fall back to minimum dimensions
      expect(canvas.width).toBeGreaterThanOrEqual(320);
      expect(canvas.height).toBeGreaterThan(0);
    });

    test('should handle extremely large window dimensions', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 10000,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 10000,
      });

      const game = new Game(canvas, context);

      // Should cap at maximum dimensions
      expect(canvas.width).toBeLessThanOrEqual(1280);
      expect(canvas.height).toBeLessThanOrEqual(720);
    });

    test('should handle canvas with existing dimensions', () => {
      canvas.width = 640;
      canvas.height = 480;

      const game = new Game(canvas, context);

      // Should override with calculated dimensions
      expect(canvas.width).not.toBe(640);
      expect(canvas.height).not.toBe(480);
    });
  });
});