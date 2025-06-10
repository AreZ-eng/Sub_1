module.exports = (sequelize, Sequelize) => {
    const Candidate = sequelize.define("candidate", {
        candidateNumber: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        party: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        photourl: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isUrl: { msg: "Photo URL must be a valid URL." },
            },
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
        timestamps: true
    });

    return Candidate;
};
