/********************************************************************************
* BTI325 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: _Sneha Maharjan_ Student ID: ___170814222____ Date: ___2024-11-14____
*
* Published url -
********************************************************************************/
const projectData = require("./modules/projects");
const express = require('express');
const path = require("path");

const app = express();
const HTTP_PORT = 3000;

app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');

app.use(express.urlencoded({extended:true}));

const main = async() =>{
    await projectData.Initialize();


    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
    
    app.get('/',(req, res) => {
            // res.send('Assignment2:Student Name - Sneha Maharjan Student ID - 170814222');

            res.render("home");
    });

    app.get('/about', (req, res) => {
        res.render("about");
    })
   
// 

    app.get('/solutions/projects',async(req,res)=>{
        const sector = req.query.sector; 
       try{
            // query filter params
            
            if(sector) {
                let sectors = await projectData.getProjectBySector(sector);
                // res.send(sectors);
                res.render("projects", {projects: sectors});
            } else {
                let project = await projectData.getAllProject();
                //res.send(await projectData.getAllProject());
                res.render("projects", {projects: project});
            }
       }catch(error){
        res.status(404).render("404", {message: `No projects found for the sector: ${sector}`});
       }
    });

    app.get('/solutions/projects/:id', async(req,res) =>{
        try{    
            const id = parseInt(req.params.id); 
            let projectId = await projectData.getProjectById(id);
            // console.log(projectId);
            res.render("project", {project: projectId});
        }catch(error){
            res.status(404).render("404", { message: "Unable to find requested project."});
        }


    });

    
    app.get('/solutions/addProject', async(req,res) =>{
        try {
            const sectorData = await projectData.getAllSectors(); 
            res.render("addProject", { sectors: sectorData }); 
            
        } catch (err){
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        }

    });
    
     
    app.post('/solutions/addProject', async(req,res) =>{
       
       try{
            const newProjectData = req.body;
            await projectData.addProject(newProjectData);
            res.redirect("/solutions/projects");
       }catch(error){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` })
       }
    });

    app.get('/solutions/editProject/:id', async(req,res) =>
    {
        const projectId = parseInt(req.params.id);
        try{

            const  prjData = await projectData.getProjectById(projectId);

            const  sectorData = await projectData.getAllSectors();

            res.render("editProject", { sectors: sectorData, project: prjData});
        }catch(err)
        {
            res.status(404).render("404", { message: err });
        }

    });

    app.post('/solutions/editProject',async(req,res) =>{
            const id =  parseInt(req.body.id);
            const projData = req.body;
        try{
            await projectData.editProject(id,projData);
            res.redirect("/solutions/projects");

        }catch(error)
        {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
        }

    });

    app.get('/solutions/deleteProject/:id', async(req,res) => {
        const delId = parseInt(req.params.id);
        try
        {
            await projectData.deleteProject(delId);
            res.redirect("/solutions/projects");

        }catch(error)
        {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
        }
    });
    // Other route handlers, middleware, etc ...

    app.use((req, res, next) => {
        // res.status(404).render("404"); 
        res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for."});
    });
  
  // app.listen()

    // app.get('/solutions/projects/sector-demo', async(req,res) =>{
    //     try{
    //         res.send(await projectData.getProjectBySector('ind'));
    //     }catch(error)
    //     {
    //         res.send(error);         
    //     }
    // });
};
main();

