"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserTitles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            UserTitles.belongsTo(models.Users, {
                foreignKey: "userId",
                as: "owner",
            })

            UserTitles.belongsTo(models.Titles, {
                foreignKey: "titleId",
                as: "title",
            })

            UserTitles.belongsTo(models.Users, {
                foreignKey: "grantedBy",
                as: "grantor",
            })
        }

        static async grantTitle({ userId, titleId, grantedBy = null, isCustom = false, isSystemGrant = true, isActive = false } = {}) {
            if (userId == null || titleId == null) {
                throw new Error("userId and titleId must be specified.");
            }
            if (!isSystemGrant && grantedBy == null) {
                throw new Error("grantedBy must be specified for non-system grants.");
            }
            return await this.create({
                userId: userId,
                titleId: titleId,
                grantedBy: grantedBy,
                isSystemGrant: isSystemGrant,
                isActive: isActive,
            })
        }

        // Basic UserTitle getter
        static async getTitlesByUserId({ userId, isCustom = null, isSystemGrant = null, isActive = null } = {}) {
            const whereCondition = { userId };
            if (isCustom !== null) {
                whereCondition.isCustom = isCustom;
            }
            if (isSystemGrant !== null) {
                whereCondition.isSystemGrant = isSystemGrant;
            }
            if (isActive !== null) {
                whereCondition.isActive = isActive;
            }
            return await this.findAll({
                where: whereCondition,
                include: [
                    {
                        model: sequelize.models.Titles,
                        as: "title"
                    },
                ],
            })
        }

        static async getActiveTitlesByUserId(userId) {
            return await this.getTitlesByUserId(userId, isActive = true);
        }

        static async getCustomTitlesByUserId(userId) {
            return await this.getTitlesByUserId(userId, isCustom = true);
        }

        static async getSystemGrantedTitlesByUserId(userId) {
            return await this.getTitlesByUserId(userId, isSystemGrant = true);
        }

    }

    UserTitles.init(
        {
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            titleId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "titles",
                    key: "titleId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            grantedBy: {
                type: DataTypes.STRING,
                allowNull: true,  // null if system grant
                defaultValue: null,
                references: {
                    model: "users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "NO ACTION",
            },
            isSystemGrant: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "UserTitles",
            tableName: "user_titles",
            timestamps: true,
        }
    );

    return UserTitles;
};
