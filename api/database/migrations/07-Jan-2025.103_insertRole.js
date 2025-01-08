const rolesJson = require('../seeders/roles');

module.exports = {
  async up(db) {
    try {
      const rolesCollection = db.collection('roles');
      console.log('Inserting roles...', rolesJson);

      if (!Array.isArray(rolesJson) || rolesJson.length === 0) {
        throw new Error('rolesJson is not an array or is empty');
      }

      const result = await rolesCollection.insertMany(rolesJson);
      console.log('Roles inserted successfully', result);
    } catch (error) {
      console.error('Error inserting roles:', error);
    }
  },

  async down(db) {
    try {
      const rolesCollection = db.collection('roles');
      const roleNames = rolesJson.map(role => role.name);
      await rolesCollection.deleteMany({ name: { $in: roleNames } });
      console.log('Roles removed successfully');
    } catch (error) {
      console.error('Error removing roles:', error);
    }
  }
};