module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env', // Chemin vers votre fichier .env
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
