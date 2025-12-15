module.exports = {
  // ... other configurations
  
  // Add 'prettier' as the last item to override conflicting rules
  extends: [
    'eslint:recommended',
    'plugin:solid/recommended',
    'prettier' // <-- ADD THIS
  ],

  // ... rest of the file
};
