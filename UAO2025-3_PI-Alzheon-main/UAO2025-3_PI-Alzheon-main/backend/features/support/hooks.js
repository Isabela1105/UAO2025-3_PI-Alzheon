import { BeforeAll, AfterAll, After, Before } from '@cucumber/cucumber';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

BeforeAll(async function() {
  // Start in-memory MongoDB and set MONGO_URI before importing app
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';

  // Important: import the app after MONGO_URI is set
  const { default: app } = await import('../../server.js');
  global.APP = app;
});

After(async function() {
  // Clean DB after each scenario
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
