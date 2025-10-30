/**
 * Main entry point for Space Invaders game
 * Initializes the game canvas, sets up rendering context, and manages game lifecycle
 * @module main
 */

import Game from './game/Game.js';

/**
 * Logger utility for structured logging with context
 */
const logger = {
  /**
   * Log info message with context
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   */
  info(message, context = {}) {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },

  /**
   * Log error message with context
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or context
   */
  error(message, error = {}) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      })
    );
  },

  /**
   * Log warning message with context
   * @param {string} message - Warning message
   * @param {Object} context - Additional context data
   */
  warn(message, context = {}) {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
};

/**
 * Check if game canvas feature is enabled via feature flag
 * @returns {boolean} True if feature is enabled
 */
function isFeatureEnabled() {
  try {
    const featureFlag = localStorage.getItem('ENABLE_GAME_CANVAS');
    if (featureFlag === null) {
      return true; // Default to enabled
    }
    return featureFlag !== 'false' && featureFlag !== '0';
  } catch (error) {
    logger.warn('Failed to read feature flag from localStorage', {
      error: error.message,
    });
    return true; // Default to enabled on error
  }
}

/**
 * Check if browser supports HTML5 Canvas
 * @returns {boolean} True if canvas is supported
 */
function isCanvasSupported() {
  const canvas = document.createElement('canvas');
  return !!(
    canvas.getContext &&
    canvas.getContext('2d') &&
    typeof canvas.getContext('2d').fillRect === 'function'
  );
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
  const statusElement = document.getElementById('gameStatus');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    statusElement.style.color = '#ff4444';
    statusElement.style.padding = '20px';
    statusElement.style.textAlign = 'center';
    statusElement.style.fontSize = '18px';
    statusElement.setAttribute('role', 'alert');
  }
}

/**
 * Display feature disabled message to user
 */
function displayFeatureDisabledMessage() {
  const statusElement = document.getElementById('gameStatus');
  if (statusElement) {
    statusElement.textContent =
      'Game canvas is currently disabled. Enable it by setting ENABLE_GAME_CANVAS=true in localStorage.';
    statusElement.style.display = 'block';
    statusElement.style.color = '#ffaa00';
    statusElement.style.padding = '20px';
    statusElement.style.textAlign = 'center';
    statusElement.style.fontSize = '18px';
    statusElement.setAttribute('role', 'status');
  }
}

/**
 * Initialize the game
 * Sets up canvas, context, and creates Game instance
 * @returns {Promise<Game|null>} Game instance or null on failure
 */
async function init() {
  const startTime = performance.now();
  const correlationId = `init-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  logger.info('Starting game initialization', {
    correlationId,
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });

  try {
    // Check feature flag
    if (!isFeatureEnabled()) {
      logger.warn('Game canvas feature is disabled via feature flag', {
        correlationId,
      });
      displayFeatureDisabledMessage();
      return null;
    }

    // Check canvas support
    if (!isCanvasSupported()) {
      const errorMessage =
        'HTML5 Canvas is not supported in your browser. Please use a modern browser (Chrome, Firefox, Safari, or Edge).';
      logger.error('Canvas not supported', {
        correlationId,
        userAgent: navigator.userAgent,
      });
      displayErrorMessage(errorMessage);
      throw new Error('Canvas not supported');
    }

    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      const errorMessage = 'Game canvas element not found in DOM';
      logger.error(errorMessage, { correlationId });
      displayErrorMessage(
        'Failed to initialize game. Please refresh the page.'
      );
      throw new Error(errorMessage);
    }

    // Validate canvas element type
    if (!(canvas instanceof HTMLCanvasElement)) {
      const errorMessage = 'Element with id "gameCanvas" is not a canvas';
      logger.error(errorMessage, {
        correlationId,
        elementType: canvas.constructor.name,
      });
      displayErrorMessage(
        'Failed to initialize game. Please refresh the page.'
      );
      throw new Error(errorMessage);
    }

    // Get 2D rendering context
    const context = canvas.getContext('2d');
    if (!context) {
      const errorMessage = 'Failed to get 2D rendering context from canvas';
      logger.error(errorMessage, { correlationId });
      displayErrorMessage(
        'Failed to initialize game graphics. Please refresh the page.'
      );
      throw new Error(errorMessage);
    }

    // Validate context
    if (typeof context.fillRect !== 'function') {
      const errorMessage = '2D context does not support required operations';
      logger.error(errorMessage, { correlationId });
      displayErrorMessage(
        'Your browser does not fully support the required graphics features.'
      );
      throw new Error(errorMessage);
    }

    logger.info('Canvas and context initialized successfully', {
      correlationId,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });

    // Initialize Game instance
    let game;
    try {
      game = new Game(canvas, context);
      logger.info('Game instance created successfully', {
        correlationId,
        gameInstanceId: game.id || 'unknown',
      });
    } catch (error) {
      logger.error('Failed to create Game instance', {
        correlationId,
        error: error.message,
        stack: error.stack,
      });
      displayErrorMessage(
        'Failed to initialize game. Please refresh the page.'
      );
      throw error;
    }

    const initTime = performance.now() - startTime;
    logger.info('Game initialization completed successfully', {
      correlationId,
      initTimeMs: initTime.toFixed(2),
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });

    // Log performance metric
    if (window.performance && window.performance.mark) {
      window.performance.mark('game-init-complete');
      window.performance.measure('game-init', 'game-init-complete');
    }

    return game;
  } catch (error) {
    const initTime = performance.now() - startTime;
    logger.error('Game initialization failed', {
      correlationId,
      error: error.message,
      stack: error.stack,
      initTimeMs: initTime.toFixed(2),
    });

    // Ensure error message is displayed
    if (error.message !== 'Canvas not supported') {
      displayErrorMessage(
        'An unexpected error occurred. Please refresh the page or try a different browser.'
      );
    }

    return null;
  }
}

/**
 * Handle DOMContentLoaded event
 * Initializes game when DOM is ready
 */
function handleDOMContentLoaded() {
  logger.info('DOM content loaded, initializing game', {
    readyState: document.readyState,
    timestamp: new Date().toISOString(),
  });

  init().catch((error) => {
    logger.error('Unhandled error during game initialization', {
      error: error.message,
      stack: error.stack,
    });
  });
}

/**
 * Handle page visibility change
 * Logs when page becomes visible/hidden for debugging
 */
function handleVisibilityChange() {
  if (document.hidden) {
    logger.info('Page hidden', { timestamp: new Date().toISOString() });
  } else {
    logger.info('Page visible', { timestamp: new Date().toISOString() });
  }
}

/**
 * Handle unhandled errors
 * @param {ErrorEvent} event - Error event
 */
function handleError(event) {
  logger.error('Unhandled error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? event.error.message : 'Unknown error',
    stack: event.error ? event.error.stack : undefined,
  });
}

/**
 * Handle unhandled promise rejections
 * @param {PromiseRejectionEvent} event - Promise rejection event
 */
function handleUnhandledRejection(event) {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise,
  });
}

// Set up event listeners
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  // DOM already loaded
  handleDOMContentLoaded();
}

// Set up visibility change listener for debugging
document.addEventListener('visibilitychange', handleVisibilityChange);

// Set up global error handlers
window.addEventListener('error', handleError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Export for testing
export { init, isFeatureEnabled, isCanvasSupported };