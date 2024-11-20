module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '../backend/.env', // Assurez-vous que le chemin est correct
        safe: false,
        allowUndefined: true
      }]
    ]
  };
};