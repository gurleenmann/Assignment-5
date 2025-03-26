/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Gurleen Mann  Student ID: 156402232  Date: 25-03-2025
*
*  Published URL:  
*
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

const { 
    initialize, 
    getAllSites, 
    getSiteById, 
    getSitesByRegion, 
    getAllProvincesAndTerritories, 
    addSite, 
    editSite, 
    deleteSite 
} = require('./module/data-service');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Database
initialize().then(() => {
    console.log("Database initialized successfully.");
}).catch(err => {
    console.error("Error initializing database:", err);
});

// Home Route
app.get('/', (req, res) => res.render("home"));

// About Route
app.get('/about', (req, res) => res.render("about"));

// Get All Sites
app.get('/sites', async (req, res) => {
    try {
        const region = req.query.region;
        let sites = await getAllSites();

        if (region) {
            sites = sites.filter(site => site.ProvinceOrTerritory.region === region);
            if (sites.length === 0) {
                return res.status(404).render("404", { message: "No sites found for the selected region." });
            }
        }

        res.render("sites", { sites });
    } catch (error) {
        console.error("Error fetching sites:", error);
        res.status(500).send("Error loading sites.");
    }
});

// Get Site by ID
app.get('/sites/:id', async (req, res) => {
    try {
        const site = await getSiteById(req.params.id);
        if (site) {
            res.render('site', { site });
        } else {
            res.status(404).render('404', { message: "Site not found." });
        }
    } catch (error) {
        console.error("Error fetching site:", error);
        res.status(500).render('404', { message: "Error fetching site details." });
    }
});

// GET Add Site Form
app.get('/addSite', async (req, res) => {
    try {
        const provincesAndTerritories = await getAllProvincesAndTerritories();
        res.render('addSite', { provincesAndTerritories });
    } catch (err) {
        res.render('500', { message: "Failed to load provinces and territories." });
    }
});

// POST Add Site
app.post('/addSite', async (req, res) => {
    try {
        // Insert new site into the database
        const newSite = {
            siteId: req.body.siteId,
            site: req.body.site,
            image: req.body.image,
            date: req.body.date,
            dateType: req.body.dateType,
            designated: req.body.designated,
            location: req.body.location,
            provinceOrTerritoryCode: req.body.provinceOrTerritoryCode,
            description: req.body.description,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };
        
        await addSite(newSite);
        res.redirect('/sites');
    } catch (err) {
        res.render('500', { message: `Error: ${err.message}` });
    }
});

// GET Edit Site Form
app.get('/editSite/:id', async (req, res) => {
    try {
        const site = await getSiteById(req.params.id);
        const provincesAndTerritories = await getAllProvincesAndTerritories();
        res.render("editSite", { provincesAndTerritories, site });
    } catch (err) {
        res.status(404).render("404", { message: err.message });
    }
});

// POST Edit Site
app.post('/editSite', async (req, res) => {
    try {
        // Update site data in the database
        await editSite(req.body.siteId, req.body);
        res.redirect('/sites');
    } catch (err) {
        res.render('500', { message: `Error: ${err.message}` });
    }
});

// GET Delete Site
app.get('/deleteSite/:id', async (req, res) => {
    try {
        // Delete site from the database
        await deleteSite(req.params.id);
        res.redirect('/sites');
    } catch (err) {
        res.render('500', { message: `Error: ${err.message}` });
    }
});

// 404 Page for Unknown Routes
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found." });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
