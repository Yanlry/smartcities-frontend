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
          safe: false,  // Facultatif : désactive la vérification des variables obligatoires
          allowUndefined: true, // Permet les variables non définies
        },
      ],
    ],
  };
};
