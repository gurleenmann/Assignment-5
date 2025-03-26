require('dotenv').config();
const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true, 
                rejectUnauthorized: false
            }
        },
        logging: false
    }
);

const ProvinceOrTerritory = sequelize.define('ProvinceOrTerritory', {
    code: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    region: Sequelize.STRING,
    capital: Sequelize.STRING
}, { timestamps: false });

const Site = sequelize.define('Site', {
    siteId: { type: Sequelize.STRING, primaryKey: true },
    site: Sequelize.STRING,
    description: Sequelize.TEXT,
    date: Sequelize.INTEGER,
    dateType: Sequelize.STRING,
    image: Sequelize.STRING,
    location: Sequelize.STRING,
    latitude: Sequelize.FLOAT,
    longitude: Sequelize.FLOAT,
    designated: Sequelize.INTEGER,
    provinceOrTerritoryCode: Sequelize.STRING
}, { timestamps: false });

Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

async function initialize() {
    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL successfully.");
        await sequelize.sync();
        console.log("Database synced successfully.");
    } catch (error) {
        console.error(" Error connecting to the database:", error);
        throw new Error("Unable to initialize database.");
    }
}

async function getAllSites() {
    try {
        const sites = await Site.findAll({
            include: [ProvinceOrTerritory] 
        });
        if (!sites || sites.length === 0) {
            throw new Error("No sites found.");
        }
        return sites;
    } catch (error) {
        throw new Error("Unable to fetch sites.");
    }
}

async function getSiteById(id) {
    try {
        const site = await Site.findAll({
            where: { siteId: id },
            include: [ProvinceOrTerritory]
        });
        if (site.length === 0) throw new Error("Site not found.");
        return site[0]; 
    } catch (error) {
        throw new Error("Unable to find requested site.");
    }
}

async function getSitesByProvinceOrTerritoryName(provinceOrTerritory) {
    try {
        const sites = await Site.findAll({
            include: [ProvinceOrTerritory],
            where: {
                '$ProvinceOrTerritory.name$': {
                    [Sequelize.Op.iLike]: `%${provinceOrTerritory}%`
                }
            }
        });
        if (!sites || sites.length === 0) {
            throw new Error("Unable to find requested sites.");
        }
        return sites;
    } catch (error) {
        throw new Error("Unable to find requested sites.");
    }
}

async function getSitesByRegion(region) {
    try {
        const sites = await Site.findAll({
            include: [ProvinceOrTerritory],
            where: {
                '$ProvinceOrTerritory.region$': region
            }
        });
        if (!sites || sites.length === 0) {
            throw new Error("Unable to find requested sites.");
        }
        return sites;
    } catch (error) {
        throw new Error("Unable to find requested sites.");
    }
}

async function addSite(siteData) {
    try {
        await Site.create(siteData);
    } catch (error) {
        throw new Error(error.errors[0].message);
    }
}

async function editSite(id, siteData) {
    try {
        await Site.update(siteData, { where: { siteId: id } });
    } catch (error) {
        throw new Error(error.errors[0].message);
    }
}

async function deleteSite(id) {
    try {
        await Site.destroy({ where: { siteId: id } });
    } catch (error) {
        throw new Error("Unable to delete site.");
    }
}

async function getAllProvincesAndTerritories() {
    try {
        const provincesAndTerritories = await ProvinceOrTerritory.findAll();
        return provincesAndTerritories;
    } catch (error) {
        throw new Error("Unable to fetch provinces and territories.");
    }
}

module.exports = {
    initialize,
    getAllSites,
    getSiteById,
    getSitesByProvinceOrTerritoryName,
    getSitesByRegion,
    addSite,
    editSite,
    deleteSite,
    getAllProvincesAndTerritories 
};
