/**
 * Core Game class that manages canvas setup, responsive sizing, and basic rendering infrastructure
 * Handles canvas initialization, responsive resizing with 16:9 aspect ratio, and rendering lifecycle
 * @module game/Game
 */

/**
 * Game class - Core game engine managing canvas, rendering, and game loop
 */
export default class Game {
  /**
   * Create a new Game instance
   * @param {HTMLCanvasElement} canvas - The canvas element for rendering
   * @param {CanvasRenderingContext2D} context - The 2D rendering context
   * @throws {Error} If canvas or context is invalid
   */
  constructor(canvas, context) {
    const correlationId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate canvas parameter
    if (!canvas) {
      const error = new Error('Canvas parameter is required');
      this._logError('Game constructor failed: canvas is null or undefined', {
        correlationId,
        error: error.message,
      });
      throw error;
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      const error = new Error(
        `Canvas must be an HTMLCanvasElement, got ${canvas.constructor.name}`
      );
      this._logError('Game constructor failed: invalid canvas type', {
        correlationId,
        providedType: canvas.constructor.name,
        error: error.message,
      });
      throw error;
    }

    // Validate context parameter
    if (!context) {
      const error = new Error('Context parameter is required');
      this._logError('Game constructor failed: context is null or undefined', {
        correlationId,
        error: error.message,
      });
      throw error;
    }

    if (typeof context.fillRect !== 'function') {
      const error = new Error(
        'Context must be a valid CanvasRenderingContext2D with fillRect method'
      );
      this._logError('Game constructor failed: invalid context', {
        correlationId,
        error: error.message,
      });
      throw error;
    }

    // Store references
    this._canvas = canvas;
    this._context = context;
    this._id = correlationId;
    this._isSetup = false;
    this._resizeTimeoutId = null;
    this._resizeDebounceMs = 150;

    // Bind methods to maintain context
    this._handleResize = this._handleResize.bind(this);

    this._logInfo('Game instance created', {
      correlationId: this._id,
      canvasId: canvas.id || 'unknown',
      initialWidth: canvas.width,
      initialHeight: canvas.height,
    });

    // Initialize canvas setup
    try {
      this.setupCanvas();
      this._isSetup = true;
      this._logInfo('Game setup completed successfully', {
        correlationId: this._id,
      });
    } catch (error) {
      this._logError('Game setup failed during constructor', {
        correlationId: this._id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get the game instance ID
   * @returns {string} Unique game instance identifier
   */
  get id() {
    return this._id;
  }

  /**
   * Get the canvas element
   * @returns {HTMLCanvasElement} The game canvas
   */
  getCanvas() {
    return this._canvas;
  }

  /**
   * Get the rendering context
   * @returns {CanvasRenderingContext2D} The 2D rendering context
   */
  getContext() {
    return this._context;
  }

  /**
   * Setup canvas with responsive sizing maintaining 16:9 aspect ratio
   * Configures canvas dimensions based on window size and sets up resize listener
   * @throws {Error} If canvas setup fails
   */
  setupCanvas() {
    try {
      this._logInfo('Setting up canvas', {
        correlationId: this._id,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });

      // Calculate responsive dimensions with 16:9 aspect ratio
      const dimensions = this._calculateCanvasDimensions();

      // Apply dimensions to canvas
      this._canvas.width = dimensions.width;
      this._canvas.height = dimensions.height;

      // Apply CSS dimensions for proper scaling
      this._canvas.style.width = `${dimensions.width}px`;
      this._canvas.style.height = `${dimensions.height}px`;

      // Set up resize event listener with debouncing
      this._setupResizeListener();

      this._logInfo('Canvas setup completed', {
        correlationId: this._id,
        canvasWidth: this._canvas.width,
        canvasHeight: this._canvas.height,
        aspectRatio: (this._canvas.width / this._canvas.height).toFixed(2),
      });
    } catch (error) {
      this._logError('Canvas setup failed', {
        correlationId: this._id,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to setup canvas: ${error.message}`);
    }
  }

  /**
   * Calculate canvas dimensions maintaining 16:9 aspect ratio
   * @private
   * @returns {{width: number, height: number}} Calculated dimensions
   */
  _calculateCanvasDimensions() {
    const targetAspectRatio = 16 / 9;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    let width, height;

    // Account for padding/margins (10px on each side)
    const maxWidth = windowWidth - 20;
    const maxHeight = windowHeight - 20;

    if (windowAspectRatio > targetAspectRatio) {
      // Window is wider than target ratio - constrain by height
      height = Math.min(maxHeight, 720); // Max height of 720px for performance
      width = Math.round(height * targetAspectRatio);
    } else {
      // Window is taller than target ratio - constrain by width
      width = Math.min(maxWidth, 1280); // Max width of 1280px for performance
      height = Math.round(width / targetAspectRatio);
    }

    // Ensure minimum dimensions for playability
    const minWidth = 320;
    const minHeight = Math.round(minWidth / targetAspectRatio);

    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);

    // Ensure dimensions are even numbers for better rendering
    width = Math.round(width / 2) * 2;
    height = Math.round(height / 2) * 2;

    return { width, height };
  }

  /**
   * Setup resize event listener with debouncing
   * @private
   */
  _setupResizeListener() {
    try {
      // Remove existing listener if any
      window.removeEventListener('resize', this._handleResize);

      // Add new listener
      window.addEventListener('resize', this._handleResize, { passive: true });

      this._logInfo('Resize listener setup completed', {
        correlationId: this._id,
      });
    } catch (error) {
      this._logError('Failed to setup resize listener', {
        correlationId: this._id,
        error: error.message,
      });
      // Non-critical error - don't throw, just log
    }
  }

  /**
   * Handle window resize events with debouncing
   * @private
   */
  _handleResize() {
    // Clear existing timeout
    if (this._resizeTimeoutId !== null) {
      clearTimeout(this._resizeTimeoutId);
    }

    // Debounce resize handling
    this._resizeTimeoutId = setTimeout(() => {
      try {
        this._logInfo('Handling resize event', {
          correlationId: this._id,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        });

        const oldWidth = this._canvas.width;
        const oldHeight = this._canvas.height;

        // Recalculate and apply dimensions
        const dimensions = this._calculateCanvasDimensions();
        this._canvas.width = dimensions.width;
        this._canvas.height = dimensions.height;
        this._canvas.style.width = `${dimensions.width}px`;
        this._canvas.style.height = `${dimensions.height}px`;

        this._logInfo('Canvas resized', {
          correlationId: this._id,
          oldWidth,
          oldHeight,
          newWidth: this._canvas.width,
          newHeight: this._canvas.height,
        });

        // Re-render after resize
        this.render();
      } catch (error) {
        this._logError('Resize handling failed', {
          correlationId: this._id,
          error: error.message,
          stack: error.stack,
        });
      }
    }, this._resizeDebounceMs);
  }

  /**
   * Clear the entire canvas
   * Fills canvas with transparent pixels
   */
  clearCanvas() {
    try {
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    } catch (error) {
      this._logError('Failed to clear canvas', {
        correlationId: this._id,
        error: error.message,
        canvasWidth: this._canvas.width,
        canvasHeight: this._canvas.height,
      });
      throw new Error(`Failed to clear canvas: ${error.message}`);
    }
  }

  /**
   * Basic render method that clears canvas and draws a test rectangle
   * This is a placeholder for the actual game rendering logic
   */
  render() {
    try {
      // Clear canvas
      this.clearCanvas();

      // Draw test rectangle in center
      const rectWidth = 100;
      const rectHeight = 100;
      const x = (this._canvas.width - rectWidth) / 2;
      const y = (this._canvas.height - rectHeight) / 2;

      // Set fill style
      this._context.fillStyle = '#00ff00';

      // Draw rectangle
      this._context.fillRect(x, y, rectWidth, rectHeight);

      // Draw border
      this._context.strokeStyle = '#ffffff';
      this._context.lineWidth = 2;
      this._context.strokeRect(x, y, rectWidth, rectHeight);

      this._logInfo('Render completed', {
        correlationId: this._id,
        canvasWidth: this._canvas.width,
        canvasHeight: this._canvas.height,
        rectX: x,
        rectY: y,
      });
    } catch (error) {
      this._logError('Render failed', {
        correlationId: this._id,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to render: ${error.message}`);
    }
  }

  /**
   * Cleanup resources and remove event listeners
   * Should be called when game instance is no longer needed
   */
  destroy() {
    try {
      this._logInfo('Destroying game instance', {
        correlationId: this._id,
      });

      // Clear any pending resize timeout
      if (this._resizeTimeoutId !== null) {
        clearTimeout(this._resizeTimeoutId);
        this._resizeTimeoutId = null;
      }

      // Remove resize listener
      window.removeEventListener('resize', this._handleResize);

      // Clear canvas
      this.clearCanvas();

      this._logInfo('Game instance destroyed', {
        correlationId: this._id,
      });
    } catch (error) {
      this._logError('Error during game destruction', {
        correlationId: this._id,
        error: error.message,
      });
    }
  }

  /**
   * Log info message with structured context
   * @private
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   */
  _logInfo(message, context = {}) {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        component: 'Game',
        message,
        ...context,
      })
    );
  }

  /**
   * Log error message with structured context
   * @private
   * @param {string} message - Error message
   * @param {Object} context - Additional context data
   */
  _logError(message, context = {}) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        component: 'Game',
        message,
        ...context,
      })
    );
  }
}