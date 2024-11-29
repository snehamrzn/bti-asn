/********************************************************************************
 * BTI325 – Assignment 06
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: _Sneha Maharjan_ Student ID: ___170814222____ Date: ___2024-11-29____
 *
 * Published url - bti-asn-3.vercel.app
 ********************************************************************************/
const projectData = require("./modules/projects");
const authData = require("./modules/auth-service");

const clientSessions = require("client-sessions");

const express = require("express");
const path = require("path");

const app = express();
const HTTP_PORT = 3000;

app.use(
  clientSessions({
    cookieName: "session",
    secret: "o6LjQ5EVNC28ZgK64hDELM18ScpFQr",
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");

app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

const main = async () => {
  try {
    await projectData.Initialize();
    await authData.Initialize();

    app.listen(HTTP_PORT, function () {
      console.log(`app listening on: ${HTTP_PORT}`);
    });
  } catch (err) {
    console.log(`unable to start server ${err}`);
  }

  app.get("/", (req, res) => {
    // res.send('Assignment2:Student Name - Sneha Maharjan Student ID - 170814222');

    res.render("home");
  });

  app.get("/about", (req, res) => {
    res.render("about");
  });

  //

  app.get("/solutions/projects", async (req, res) => {
    const sector = req.query.sector;
    try {
      // query filter params

      if (sector) {
        let sectors = await projectData.getProjectBySector(sector);
        // res.send(sectors);
        res.render("projects", { projects: sectors });
      } else {
        let project = await projectData.getAllProject();
        //res.send(await projectData.getAllProject());
        res.render("projects", { projects: project });
      }
    } catch (error) {
      res.status(404).render("404", {
        message: `No projects found for the sector: ${sector}`,
      });
    }
  });

  app.get("/solutions/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let projectId = await projectData.getProjectById(id);
      // console.log(projectId);
      res.render("project", { project: projectId });
    } catch (error) {
      res
        .status(404)
        .render("404", { message: "Unable to find requested project." });
    }
  });

  app.get("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
      const sectorData = await projectData.getAllSectors();
      res.render("addProject", { sectors: sectorData });
    } catch (err) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    }
  });

  app.post("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
      const newProjectData = req.body;
      await projectData.addProject(newProjectData);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    }
  });

  app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
    const projectId = parseInt(req.params.id);
    try {
      const prjData = await projectData.getProjectById(projectId);

      const sectorData = await projectData.getAllSectors();

      res.render("editProject", { sectors: sectorData, project: prjData });
    } catch (err) {
      res.status(404).render("404", { message: err });
    }
  });

  app.post("/solutions/editProject", ensureLogin, async (req, res) => {
    const id = parseInt(req.body.id);
    const projData = req.body;
    try {
      await projectData.editProject(id, projData);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    }
  });

  app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
    const delId = parseInt(req.params.id);
    try {
      await projectData.deleteProject(delId);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    }
  });

  app.get("/login", (req, res) => {
    res.render("login", { errorMessage: "", userName: "" });
  });

  app.get("/register", (req, res) => {
    res.render("register", {
      errorMessage: "",
      successMessage: "",
      userName: "",
    });
  });

  app.post("/register", async (req, res) => {
    const userData = req.body;
    try {
      await authData.registerUser(userData);
      res.render("register", {
        errorMessage: "",
        successMessage: "User created",
        userName: "",
      });
    } catch (err) {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
      });
    }
  });

  app.post("/login", async (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    try {
      let user = await authData.checkUser(req.body);
      req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory, // authenticated user's loginHistory
      };
      res.redirect("/solutions/projects");
    } catch (err) {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    }
  });

  app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
  });

  app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
  });
  // Other route handlers, middleware, etc ...

  app.use((req, res, next) => {
    // res.status(404).render("404");
    res.status(404).render("404", {
      message: "I'm sorry, we're unable to find what you're looking for.",
    });
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
