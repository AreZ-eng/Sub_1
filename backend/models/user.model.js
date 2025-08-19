module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        nama: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        alamat: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        tiket: {
            type: Sequelize.STRING,
            allowNull: false
        },
        tps:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        role: {
            type: Sequelize.ENUM('voter', 'admin'),
            allowNull: false,
            defaultValue: 'voter'
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        }
    }, {
        timestamps: true,
    });

    return User;
};
