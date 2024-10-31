/********************************************************************************
* BTI325 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: _Sneha Maharjan_ Student ID: ___170814222____ Date: ___2024-10-8____
*
* Published url- bti-asn-3.vercel.app
********************************************************************************/
const projectData = require("./modules/projects");
const express = require('express');
const path = require("path");

const app = express();
const HTTP_PORT = 3000;

app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');

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
            const id = parseInt(req.params.id); // returns a string, parsing to int
            let projectId = await projectData.getProjectById(id);
            res.render("project", {project: projectId});
        }catch(error){
            res.status(404).render("404", { message: "Unable to find requested project."});
        }


    });

    // Other route handlers, middleware, etc ...

    app.use((req, res, next) => {
        // res.status(404).render("404"); 
        res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
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

