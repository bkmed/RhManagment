/* eslint-disable no-undef */
plugins = () => {
  const defaultPlugins = [
    ['module-resolver', { root: ['./'], alias: { src: './src' } }],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
  ];
  if (process.env.NODE_ENV === 'production') {
    defaultPlugins.push('transform-remove-console');
  }
  defaultPlugins.push('react-native-worklets/plugin');
  return defaultPlugins;
};

module.exports = {
  presets: [
    '@babel/preset-react',
    'module:@react-native/babel-preset',
    'nativewind/babel',
  ],
  plugins: plugins(),
};
