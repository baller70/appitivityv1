#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Performance tracking
const phases = {
  configParsing: { start: 0, end: 0, duration: 0 },
  fileWatching: { start: 0, end: 0, duration: 0 },
  moduleCompilation: { start: 0, end: 0, duration: 0 },
  hotReloadSetup: { start: 0, end: 0, duration: 0 },
  total: { start: 0, end: 0, duration: 0 }
};

const slowComponents = [];
const errors = [];
const warnings = [];

console.log('🚀 Starting Next.js Dev Server Performance Profiling...');
console.log('='.repeat(60));

// Start total timing
phases.total.start = Date.now();

// Spawn the Next.js dev server
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

let serverReady = false;
let configPhaseComplete = false;
let watchingPhaseComplete = false;
let compilationPhaseComplete = false;

// Track config parsing phase
phases.configParsing.start = Date.now();

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  const timestamp = Date.now();
  
  // Log all output for debugging
  process.stdout.write(output);
  
  // Track config parsing completion
  if (!configPhaseComplete && (output.includes('webpack') || output.includes('compiling'))) {
    phases.configParsing.end = timestamp;
    phases.configParsing.duration = phases.configParsing.end - phases.configParsing.start;
    configPhaseComplete = true;
    phases.fileWatching.start = timestamp;
    console.log(`⚡ Config parsing completed in ${phases.configParsing.duration}ms`);
  }
  
  // Track file watching setup
  if (!watchingPhaseComplete && output.includes('watching for file changes')) {
    phases.fileWatching.end = timestamp;
    phases.fileWatching.duration = phases.fileWatching.end - phases.fileWatching.start;
    watchingPhaseComplete = true;
    phases.moduleCompilation.start = timestamp;
    console.log(`👁️  File watching setup completed in ${phases.fileWatching.duration}ms`);
  }
  
  // Track module compilation
  if (!compilationPhaseComplete && (output.includes('compiled successfully') || output.includes('ready'))) {
    phases.moduleCompilation.end = timestamp;
    phases.moduleCompilation.duration = phases.moduleCompilation.end - phases.moduleCompilation.start;
    compilationPhaseComplete = true;
    phases.hotReloadSetup.start = timestamp;
    console.log(`🔨 Module compilation completed in ${phases.moduleCompilation.duration}ms`);
  }
  
  // Track server ready state
  if (!serverReady && (output.includes('ready') || output.includes('localhost:3000'))) {
    phases.hotReloadSetup.end = timestamp;
    phases.hotReloadSetup.duration = phases.hotReloadSetup.end - phases.hotReloadSetup.start;
    phases.total.end = timestamp;
    phases.total.duration = phases.total.end - phases.total.start;
    serverReady = true;
    
    console.log(`🔥 Hot reload setup completed in ${phases.hotReloadSetup.duration}ms`);
    console.log(`✅ Total startup time: ${phases.total.duration}ms`);
    
    // Generate report
    generateReport();
    
    // Kill the server after profiling
    setTimeout(() => {
      devServer.kill();
      process.exit(0);
    }, 2000);
  }
  
  // Track slow components
  if (output.includes('slow') || output.includes('warning')) {
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('slow') || line.includes('warning')) {
        slowComponents.push({
          timestamp: timestamp,
          message: line.trim(),
          phase: getCurrentPhase()
        });
      }
    });
  }
});

devServer.stderr.on('data', (data) => {
  const output = data.toString();
  const timestamp = Date.now();
  
  // Log errors for debugging
  process.stderr.write(output);
  
  // Track errors
  if (output.includes('error') || output.includes('Error')) {
    errors.push({
      timestamp: timestamp,
      message: output.trim(),
      phase: getCurrentPhase()
    });
  }
  
  // Track warnings
  if (output.includes('warn') || output.includes('Warning')) {
    warnings.push({
      timestamp: timestamp,
      message: output.trim(),
      phase: getCurrentPhase()
    });
  }
});

devServer.on('close', (code) => {
  console.log(`\n📊 Dev server profiling completed with exit code ${code}`);
  if (!serverReady) {
    console.log('⚠️  Server did not reach ready state during profiling');
    generateReport();
  }
});

// Timeout after 2 minutes
setTimeout(() => {
  console.log('\n⏰ Profiling timeout reached (2 minutes)');
  devServer.kill();
  generateReport();
  process.exit(1);
}, 120000);

function getCurrentPhase() {
  if (!configPhaseComplete) return 'configParsing';
  if (!watchingPhaseComplete) return 'fileWatching';
  if (!compilationPhaseComplete) return 'moduleCompilation';
  if (!serverReady) return 'hotReloadSetup';
  return 'complete';
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE PROFILING REPORT');
  console.log('='.repeat(60));
  
  // Phase breakdown
  console.log('\n🔍 Phase Breakdown:');
  Object.entries(phases).forEach(([phase, data]) => {
    const percentage = phases.total.duration > 0 ? ((data.duration / phases.total.duration) * 100).toFixed(1) : '0.0';
    console.log(`  ${phase.padEnd(20)}: ${data.duration.toString().padStart(6)}ms (${percentage}%)`);
  });
  
  // Identify top 3 slowest phases
  const sortedPhases = Object.entries(phases)
    .filter(([phase]) => phase !== 'total')
    .sort(([,a], [,b]) => b.duration - a.duration)
    .slice(0, 3);
  
  console.log('\n🐌 Top 3 Slowest Phases:');
  sortedPhases.forEach(([phase, data], index) => {
    console.log(`  ${index + 1}. ${phase}: ${data.duration}ms`);
  });
  
  // Performance assessment
  console.log('\n⚡ Performance Assessment:');
  if (phases.total.duration < 5000) {
    console.log('  ✅ EXCELLENT: Under 5 seconds target!');
  } else if (phases.total.duration < 10000) {
    console.log('  ⚠️  GOOD: Under 10 seconds, but can be improved');
  } else if (phases.total.duration < 20000) {
    console.log('  🔶 MODERATE: 10-20 seconds, optimization needed');
  } else {
    console.log('  🔴 POOR: Over 20 seconds, significant optimization required');
  }
  
  // Slow components
  if (slowComponents.length > 0) {
    console.log('\n🐌 Slow Components Detected:');
    slowComponents.forEach((component, index) => {
      console.log(`  ${index + 1}. [${component.phase}] ${component.message}`);
    });
  }
  
  // Errors and warnings
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. [${error.phase}] ${error.message}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. [${warning.phase}] ${warning.message}`);
    });
  }
  
  // Optimization recommendations
  console.log('\n💡 Optimization Recommendations:');
  
  if (phases.configParsing.duration > 2000) {
    console.log('  🔧 Config parsing is slow - consider simplifying next.config.js');
  }
  
  if (phases.moduleCompilation.duration > 15000) {
    console.log('  🔨 Module compilation is slow - consider:');
    console.log('     - Enabling SWC minification');
    console.log('     - Optimizing webpack configuration');
    console.log('     - Reducing bundle size');
  }
  
  if (phases.fileWatching.duration > 1000) {
    console.log('  👁️  File watching setup is slow - consider reducing watched files');
  }
  
  if (phases.hotReloadSetup.duration > 1000) {
    console.log('  🔥 Hot reload setup is slow - check for conflicting plugins');
  }
  
  // Save detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    phases,
    slowComponents,
    errors,
    warnings,
    totalDuration: phases.total.duration,
    performanceGrade: getPerformanceGrade(phases.total.duration)
  };
  
  const reportPath = path.join(process.cwd(), 'dev-server-profile-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  console.log('\n' + '='.repeat(60));
}

function getPerformanceGrade(duration) {
  if (duration < 5000) return 'A+';
  if (duration < 10000) return 'A';
  if (duration < 15000) return 'B';
  if (duration < 20000) return 'C';
  if (duration < 30000) return 'D';
  return 'F';
} 