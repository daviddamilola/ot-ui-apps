/**
 * Detector module - detect new widgets and pages from git changes
 * 
 * Re-exports from detector/ submodules for backwards compatibility.
 */

export {
  // Git utilities
  exec,
  getChangedFiles,
  getNewFiles,
  getCurrentBranch,
  isGitRepository,
  type FileChanges,
  
  // Source file reading
  extractLocalImports,
  resolveImportPath,
  readFileWithExtension,
  readWidgetSources,
  
  // Widget detection
  detectNewWidgets,
  
  // Page detection
  detectNewPages,
  type PageInfo,
  
  // Main detect function
  detect,
} from './detector/index';
