const knex = require('../databases/knex');
const fieldValidator = require('../utils/FieldValidator');

exports.create = async (req, res) => {
  try {
    const invalidFields = fieldValidator(req.body, ['fullName', 'avatarUrl']);

    if (invalidFields.length) {
      return res.status(400).send({
        status: 'invalid request',
        invalidFields
      });
    }

    const [instructorId] = await knex.insert(req.body).into('instructors');
    
    const [instructorCreated] = await knex.select('*')
      .from('instructors').where({ id: instructorId });
      
    return res.status(200).send({
      status: 'success',
      data: instructorCreated
    })
  } catch (e) {
    return res.status(500).send({ error: e.message || e });
  }
};

exports.find = async (req, res) => {
  try {
    const Instructors = await knex.select('*').from('Instructors');
    return res.status(200).send(Instructors);
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.findById = async (req, res) => {
  try {
    const id = req.params.id;
    const instructor = await knex.select('*').from('instructors').where({id}).first();
    if(!instructor) {
      return res.status(404).send({ status: `Professor com id ${id} não foi encontrado` });
    }

    return res.status(200).send({
      ...instructor
    });
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};


exports.update = async(req, res) => {
  try {
    const {id} = req.params;
    const newInstructor = req.body;
    const instructor = await knex.select('*').from('instructors').where({id}).first();

    if(!instructor) {
      return res.status(404).send({
        status: `Nenhum instrutor com o id ${id} foi encontrado`
      })
    };

    await knex.update(newInstructor).from('instructors').where({id});
    const instructorUpdated = await knex.select('*').from('instructors').where({id}).first();
    return res.status(200).send(instructorUpdated);
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.delete = async (req, res) => {
  try {
    const {id} = req.params;
    const [instructor] = await knex.select('id').from('instructors').where({id}).first(); 

    if(!instructor) {
      return res.status(404).send(`O curso com id: ${id} não existe`);
    }
    await knex.delete({fullName: instructor.fullName}).from('instructors').where({id});
    return res.status(204).send({ status:'Professor deletado com sucesso', data: instructor});
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};