const knex = require('../databases/knex');
const fieldValidator = require('../utils/FieldValidator');

exports.create = async (req, res) => {
  try {
    const invalidFields = fieldValidator(
      req.body, ['title', 'description', 'videoId', 'instructorId', 'courseId']
    );

    if (invalidFields.length || !Object.keys(req.body).length) {
      return res.status(400).send({
        status: 'Requisição inválida',
        invalidFields
      });
    }

    // adiciona validação de campos obrigatórios
    const requiredFields = ['title', 'videoId', 'instructorId', 'courseId'];

    const requiredFieldsExists = [];
    requiredFields.forEach(requiredField => {
      if (!req.body[requiredField]) {
        requiredFieldsExists.push(requiredField);
      }
    });

    if (requiredFieldsExists.length) {
      return res.status(400).send({
        status: 'Campos obrigatórios não foram informados!',
        requiredFields: requiredFieldsExists
      });
    }

    const [course] = await knex
      .select('*')
      .from('courses')
      .where({ id: Number(req.body.courseId) });

    if (!course) {
      return res.status(404).send({
        status: `Nenhum curso com o id: ${req.body.courseId} foi encontrado`
      })
    }

    const [instructor] = await knex
      .select('*')
      .from('instructors')
      .where({ id: Number(req.body.instructorId) });

    if (!instructor) {
      return res.status(404).send({
        status: `Nenhum instrutor com id: ${req.body.instructorId} foi encontrado`
      })
    }

    const { title, videoId, description } = req.body;
    const [lessonCreatedId] = await knex
      .insert({
        title,
        videoId,
        instructorId: instructor.id,
        courseId: course.id,
        description: description ? description : null
      })
      .into('lessons');
    
    const [lessonCreated] = await knex
      .select('*')
      .from('lessons')
      .where({ id: lessonCreatedId });

    return res.status(200).send({
      status: 'success',
      data: lessonCreated
    });
  } catch (e) {
    return res.status(500).send({ error: e.message || e });
  }
};

exports.find = async (req, res) => {
  try {
    const courses = await knex.select('*').from('lessons');
    return res.status(200).send(courses);
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};


exports.findById = async (req, res) => {
  try {
    const id = req.params.id;
    const lesson = await knex.select('*').from('lessons').where({id}).first();
    if(!lesson) {
      return res.status(404).send({ status: `Aula com id ${id} não foi encontrada` });
    }

    const [instructor] = await knex.select('*').from('instructors').where({id: lesson.instructorId});
    delete instructor.id;

    delete lesson.instructorId;
    delete lesson.courseId;

    // define um avatar padrão se não existir
    if(!instructor.avatarUrl) {
      instructor.avatarUrl = 'https://avatars.dicebear.com/api/bottts/your-custom-seed.svg'
    }
    return res.status(200).send({
      ...lesson,
      instructor
    });
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.update = async(req, res) => {
  try {
    const {id} = req.params;
    const newLesson = req.body;
    const lesson = await knex.select('*').from('lessons').where({id}).first();

    if(!lesson) {
      return res.status(404).send({
        status: `Nenhuma aula com o id ${id} foi encontrado`
      })
    };

    await knex.update(newLesson).from('lessons').where({id});
    const lessonUpdated = await knex.select('*').from('lessons').where({id}).first();
    return res.status(200).send(lessonUpdated);
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.delete = async (req, res) => {
  try {
    const {id} = req.params;
    const [lesson] = await knex.select('*').from('lessons').where({id}).first(); 

    if(!lesson) {
      return res.status(404).send(`A aula com id: ${id} não existe`);
    }
    await knex.delete({title: lesson.title}).from('lessons').where({id: lesson.id});
    return res.status(204).send({ status:'Aula deletada com sucesso', data: lesson});
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};