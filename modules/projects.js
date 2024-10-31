const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects =[];


function Initialize()
{
    return new Promise((resolve,reject) => {
        try{
            projectData.forEach((element)=>{
                let sectorMatch = sectorData.find(sector => sector.id === element.sector_id );
        
                let objCopy = {...element, 
                               sector: sectorMatch ? sectorMatch.sector_name : null
                };
        
                projects.push(objCopy);
              //  console.log(objCopy);
                resolve();
            })     
        }catch(error){
            reject(`error:${error.message}`);
        }
      

    });

}

function getAllProject()
{
    return new Promise((resolve,reject) => {
        if(projects.length >0)
        {
            resolve(projects);
        }else{
            reject("unable to find requested project")
        }
        
    });
    

}

function getProjectById(projectId)
{
    return new Promise((resolve,reject) =>
    {
        
        let obj = projects.find(project => project.id === projectId);
        if(obj)
        {
            resolve(obj);
        }else{
            reject("unable to find requested project");
        }
        
    });
    
}

function getProjectBySector(sector)
{
    return new Promise((resolve, reject) =>
    {
         let objSector = projects.filter((project) => project.sector.toLowerCase().includes(sector.toLowerCase()));
         if(objSector.length > 0)
         {
             resolve(objSector) ;
         } else{
             reject("unable to find requested project");
         }
        
    });

}


module.exports = {Initialize, getAllProject, getProjectById, getProjectBySector };


