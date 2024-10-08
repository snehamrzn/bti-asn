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
********************************************************************************/
const projectData = require("./modules/projects");
const express = require('express');
const path = require("path");

const app = express();
const HTTP_PORT = 3000;

app.use(express.static('public'));

const main = async() =>{
    await projectData.Initialize();


    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
    
    app.get('/',(req, res) => {
            // res.send('Assignment2:Student Name - Sneha Maharjan Student ID - 170814222');

            res.sendFile(path.join(__dirname, "/views/home.html"))
    });

    app.get('/about', (req, res) => {
        res.sendFile(path.join(__dirname, "/views/about.html"));
    })
   
// 

    app.get('/solutions/projects',async(req,res)=>{
       try{
            const sector = req.query.sector; // query filter params
            if(sector) {
                res.send(await projectData.getProjectBySector(sector));
            } else {
                res.send(await projectData.getAllProject()); 
            }
       }catch(error){
            res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
       }
    });

    app.get('/solutions/projects/:id', async(req,res) =>{
        try{
            const id = parseInt(req.params.id); // returns a string, parsing to int
            res.send(await projectData.getProjectById(id));
        }catch(error){
            res.send(error);
        }


    });

    // Other route handlers, middleware, etc ...

    app.use((req, res, next) => {
        res.status(404).sendFile(path.join(__dirname, "/views/404.html")); 
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

