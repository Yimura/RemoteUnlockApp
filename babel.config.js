module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./frontend'],
        alias: {
          '@': './frontend',
        },
      },
    ],
  ],
};
