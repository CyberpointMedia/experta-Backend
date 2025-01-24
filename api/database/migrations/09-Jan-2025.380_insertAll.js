const rolesJson = require('../seeders/roles');
const interestsJson = require('../seeders/interests');
const languagesJson = require('../seeders/languages');
const statesJson = require('../seeders/states');
const occupationsJson = require('../seeders/occupations');

module.exports = {
  async up(db) {
    try {
      // Insert roles
      const rolesCollection = db.collection('roles');
      console.log('Inserting roles...');
      if (!Array.isArray(rolesJson) || rolesJson.length === 0) {
        throw new Error('rolesJson is not an array or is empty');
      }
      await rolesCollection.insertMany(rolesJson);
      console.log('Roles inserted successfully');

      // Insert interests
      const interestsCollection = db.collection('interests');
      console.log('Inserting interests...');
      if (!Array.isArray(interestsJson) || interestsJson.length === 0) {
        throw new Error('interestsJson is not an array or is empty');
      }
      await interestsCollection.insertMany(interestsJson);
      console.log('Interests inserted successfully');

      // Insert languages
      const languagesCollection = db.collection('languages');
      console.log('Inserting languages...');
      if (!Array.isArray(languagesJson) || languagesJson.length === 0) {
        throw new Error('languagesJson is not an array or is empty');
      }
      await languagesCollection.insertMany(languagesJson);
      console.log('Languages inserted successfully');

      // Insert states
      const statesCollection = db.collection('states');
      console.log('Inserting states...');
      if (!Array.isArray(statesJson) || statesJson.length === 0) {
        throw new Error('statesJson is not an array or is empty');
      }
      await statesCollection.insertMany(statesJson);
      console.log('States inserted successfully');

      // Insert occupations
      const occupationsCollection = db.collection('occupations');
      console.log('Inserting occupations...');
      if (!Array.isArray(occupationsJson) || occupationsJson.length === 0) {
        throw new Error('occupationsJson is not an array or is empty');
      }
      await occupationsCollection.insertMany(occupationsJson);
      console.log('Occupations inserted successfully');
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  },

  async down(db) {
    try {
      // Remove roles
      const rolesCollection = db.collection('roles');
      const roleNames = rolesJson.map(role => role.name);
      await rolesCollection.deleteMany({ name: { $in: roleNames } });
      console.log('Roles removed successfully');

      // Remove interests
      const interestsCollection = db.collection('interests');
      const interestNames = interestsJson.map(interest => interest.name);
      await interestsCollection.deleteMany({ name: { $in: interestNames } });
      console.log('Interests removed successfully');

      // Remove languages
      const languagesCollection = db.collection('languages');
      const languageNames = languagesJson.map(language => language.name);
      await languagesCollection.deleteMany({ name: { $in: languageNames } });
      console.log('Languages removed successfully');

      // Remove states
      const statesCollection = db.collection('states');
      const stateNames = statesJson.map(state => state.name);
      await statesCollection.deleteMany({ name: { $in: stateNames } });
      console.log('States removed successfully');

      // Remove occupations
      const occupationsCollection = db.collection('occupations');
      const occupationNames = occupationsJson.map(occupation => occupation.name);
      await occupationsCollection.deleteMany({ name: { $in: occupationNames } });
      console.log('Occupations removed successfully');
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }
};