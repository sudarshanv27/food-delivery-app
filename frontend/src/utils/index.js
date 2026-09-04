/**
 * Utils Index - Central export for all utility functions
 */

// Constants
export * from './constants';

// Helpers
export * from './helpers';

// Validators
export * from './validators';

// Formatters
export * from './formatters';

// Error Handler
export * from './errorHandler';

// Price Calculator
export * from './priceCalculator';

// Distance Calculator
export * from './distanceCalculator';

// Image Optimizer
export * from './imageOptimizer';

// Date Utils
export * from './dateUtils';

// Socket Utils
export * from './socketUtils';

// Re-export commonly used functions with aliases
import * as constants from './constants';
import * as helpers from './helpers';
import * as validators from './validators';
import * as formatters from './formatters';
import * as errorHandler from './errorHandler';
import * as priceCalculator from './priceCalculator';
import * as distanceCalculator from './distanceCalculator';
import * as imageOptimizer from './imageOptimizer';
import * as dateUtils from './dateUtils';
import * as socketUtils from './socketUtils';

// Default export with all utilities
const utils = {
  ...constants,
  ...helpers,
  ...validators,
  ...formatters,
  ...errorHandler,
  ...priceCalculator,
  ...distanceCalculator,
  ...imageOptimizer,
  ...dateUtils,
  ...socketUtils,
};

export default utils;