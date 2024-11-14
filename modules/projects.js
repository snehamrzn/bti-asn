require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

  const Sector = sequelize.define(
    "Sector",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sector_name: Sequelize.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
    }
  );

  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: Sequelize.STRING,
      feature_img_url: Sequelize.STRING,
      summary_short: Sequelize.TEXT,
      intro_short: Sequelize.TEXT,
      impact: Sequelize.TEXT,
      original_source_url: Sequelize.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
    }
  );

  Project.belongsTo(Sector, {foreignKey: 'sector_id'});

function Initialize()
{
    return new Promise(async (resolve,reject) => {
        try{
          sequelize.sync();
          console.log('Database synchronized successfully.');
          resolve();     
        }catch(error){
            reject('Database synchronization failed.');
        }
    });

}

function getAllProject()
{
    return new Promise(async(resolve,reject) => {
        try{
            const projects = await Project.findAll({
                include: [Sector],
            });
            resolve(projects);
        }catch(error){
            reject(error);
        }  
    });
}

function getProjectById(projectId)
{
    return new Promise(async (resolve,reject) =>
    {
        try{
            const projects = await Project.findAll(
                {
                include: [Sector],
                where: { id: projectId},
            });
            if (projects.length > 0) {
                resolve(projects[0]);
            } else {
                reject("Unable to find requested project.");
            }
        }catch(error){
            reject("Unable to find requested project.")
        }
        
    });
    
}

function getProjectBySector(sector)
{
    return new Promise(async (resolve, reject) =>
    {
        try{
            const projectSector = await Project.findAll({include: [Sector], where: {
                '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${sector}%`
                }
                }});
            resolve(projectSector);
        }catch{
            reject("Unable to find requested projects");
        }    
    });

}
function addProject(projectData)
{
    return new Promise(async (resolve, reject) =>{
        try{
            const newProject = await Project.create(projectData);
            resolve(newProject);
        }catch(error)
        {
            reject(error.errors[0].message);
        }
    });
}
function getAllSectors()
{
    return new Promise(async (resolve, reject) =>{
        try{
            const sector = await Sector.findAll();
            resolve (sector);
        }catch(error){
            reject(error);
        }
    });

}
function editProject(id, projectData)
{
    return new Promise(async (resolve, reject) =>{
       try{
        const edit = await Project.update(projectData, {
            where: { id: id },
          });
        resolve(edit);

       }catch(error){
            reject(error.errors[0].message);
        }
    });
}

function deleteProject(id)
{
    return new Promise(async (resolve, reject) =>{
        try{
            const delProject = await Project.destroy(
                {
                    where: {id: id}
                });
                resolve(delProject);
        }catch(error)
        {
            reject(error.errors[0].message);
        }

    });

}


module.exports = {
  Initialize,
  getAllProject,
  getProjectById,
  getProjectBySector,
  addProject,
  getAllSectors,
  editProject,
  deleteProject
};


