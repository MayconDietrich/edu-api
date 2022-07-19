const express = require('express');

const routes = express.Router();

const IndexController = require('./controllers/IndexController'); 
const CoursesController = require('./controllers/CoursesController');
const InstructorsController = require('./controllers/InstructorsController');
const LessonsController = require('./controllers/LessonsController');

routes.get('/', IndexController.index);

// rotas de cursos
routes.post('/courses', CoursesController.create);
routes.get('/courses', CoursesController.find)

routes.post('/instructors', InstructorsController.create);

routes.post('/lessons', LessonsController.create);

module.exports = routes;

// lessons
// courses
// instructors