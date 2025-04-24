/* eslint-disable no-undef */
plugins = () => {
  const defaultPlugins = [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          src: './src',
          data: 'data',
          'lodash-custom': 'custom-lib/lodash.custom.min',
          pica: 'pica/dist/pica.js',
        },
      },
    ],
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
  defaultPlugins.push('react-native-reanimated/plugin');
  return defaultPlugins;
};

module.exports = {
  presets: ['@babel/preset-react', 'module:@react-native/babel-preset'],
  plugins: plugins(),
};
