const { BeforeAll, AfterAll, After } = require('@cucumber/cucumber');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

BeforeAll(async function() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';

  // Import app after env is set
  const appModule = await import('../../server.js');
  global.APP = appModule.default || appModule;
});

After(async function() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    await mongoose.connection.collections[name].deleteMany({});
  }
});

AfterAll(async function() {
  try {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  } catch (err) {
    console.error('Error stopping in-memory mongo:', err);
  }
});
