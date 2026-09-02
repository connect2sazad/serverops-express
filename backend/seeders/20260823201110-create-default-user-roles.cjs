'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('user_roles', [
            {
                name: 'Administrator',
                slug: 'admin',
                status: true,
                created_at: new Date(),
                updated_at: new Date(),
                permissions: ['*']
            },
            {
                name: 'Manager',
                slug: 'manager',
                status: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'User',
                slug: 'user',
                status: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('user_roles', {
            slug: {
                [queryInterface.sequelize.Op.in]: [
                    'admin',
                    'manager',
                    'user',
                ],
            },
        });
  }
};
