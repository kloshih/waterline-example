

const assert = require('assert');
const Waterline = require('waterline');
const sailsMongoAdapter = require('sails-mongo');
// const sailsPostgresqlAdapter = require('sails-postgresql');

describe("Waterline test", function() {

  it("should work", async function() {

    const config = {
      adapters: {
        'mongo': sailsMongoAdapter,
        // 'postgres': sailsPostgresqlAdapter,
      },
      datastores: {
        default: {
          adapter: 'mongo',
          url: 'mongodb://localhost/testdb'
        },
        // postgres: {
        //   adapter: 'postgres',
        //   url: 'postgresql://gridironx:gridironx@localhost:5432/gridironx'
        // },
      }
    };

    const userCollection = Waterline.Collection.extend({
      identity: 'user',
      tableName: 'users',
      datastore: 'default',
      primaryKey: 'id',
      migrate: 'alter',
      schema: false,
      attributes: {
        'id': { type:'string', columnName:'_id' },
        'firstName': { type:'string', columnName:'first_name' },
        'lastName': { type:'string', columnName:'last_name' },
        'pets': { collection:'pet', via:'owner' },
      },
    });

    const petCollection = Waterline.Collection.extend({
      identity: 'pet',
      tableName: 'pets',
      datastore: 'default',
      primaryKey: 'id',
      migrate: 'alter',
      schema: false,
      attributes: {
        'id': { type:'string', columnName:'_id' },
        'breed': { type:'string' },
        'type': { type:'string' },
        'name': { type:'string' },
        'owner': { model:'user', columnName:'owner_id' },
      },
    });

    let waterline = new Waterline(config);
    waterline.registerModel(userCollection);
    waterline.registerModel(petCollection);
    let model = await new Promise((resolve, reject) => {
      waterline.initialize(config, (err, model) => {
        if (err) return reject(err); else resolve(model)
      });
    });
    
    let User = model.collections.user;
    let Pet = model.collections.pet;
    // console.log("model", model);

    await User.destroy({ firstName:'Sam' });
    await Pet.destroy({ name:'Pixie' })

    let user = await User.create({
      firstName: 'Sam',
      lastName: 'Rogers',
    }).fetch();
    let pet = await Pet.create({
      breed: 'Pit-Lab',
      type: 'dog',
      name: 'Pixie',
      owner: user.id,
    }).fetch();

    let users = await User.find().populate('pets');
    console.log(users);

    assert(users.length > 0);

  });

});

