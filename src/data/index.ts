/**
 * Data Index File
 * ===============
 * Central export point for all data modules
 */

// Export from valves database
export * from './valvesData';
export * from './goyenValvesData';

// Export from products database
export * from './productsDatabase';

// Export real products data (preferred over dummy data)
export * from './realProductsData';

// Re-export for backward compatibility
export { realProducts as dummyProducts } from './realProductsData';
export { valveCategories as dummyValveCategories } from './realProductsData';
export { controllerCategories as dummyControllerCategories } from './realProductsData';
export { electronicsCategories as dummyElectronicsCategories } from './realProductsData';
export { homePageFeatures } from './realProductsData';

// Export summary
export { REAL_DATA_SUMMARY as DUMMY_DATA_SUMMARY } from './realProductsData';

// Export types
export type { ValveSpecification, ValveProduct } from './valvesData';
export type { ProductDetails } from './productsDatabase';

// Main exports
export default {
  // Valve data
  ...require('./valvesData'),
  ...require('./goyenValvesData'),

  // Product database
  ...require('./productsDatabase'),

  // Real products data (primary)
  ...require('./realProductsData'),

  // For backward compatibility with existing code
  dummyProducts: require('./realProductsData').realProducts,
  dummyValveCategories: require('./realProductsData').valveCategories,
  dummyControllerCategories: require('./realProductsData').controllerCategories,
  dummyElectronicsCategories: require('./realProductsData').electronicsCategories,
  homePageFeatures: require('./realProductsData').homePageFeatures,
  DUMMY_DATA_SUMMARY: require('./realProductsData').REAL_DATA_SUMMARY
};