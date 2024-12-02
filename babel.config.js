module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Conserve le preset Expo
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '../backend/.env', // Chemin relatif vers le fichier .env dans le backend
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
