// Load environment variables
require('dotenv').config();

// Debug logs
console.log('Current working directory:', process.cwd());
console.log('MONGO_URI:', process.env.MONGO_URI || '❌ Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Exists' : '❌ Not found');

// ==============================================
// ENVIRONMENT VARIABLE VALIDATION
// ==============================================
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: Missing environment variable ${envVar}`);
    process.exit(1);
  }
});

// ==============================================
// MONGODB CONNECTION
// ==============================================
const mongoose = require('mongoose');
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Check your MONGO_URI value in .env');
    process.exit(1);
  });

// ==============================================
// EXPRESS + APOLLO SERVER SETUP
// ==============================================
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    jwtSecret: process.env.JWT_SECRET
  }),
  formatError: (err) => {
    console.error('GraphQL Error:', err);
    return {
      message: err.message,
      code: err.extensions?.code || 'INTERNAL_SERVER_ERROR'
    };
  },
  introspection: true, // ✅ enables GraphQL Playground even in production
  playground: true     // ✅ optional if using Apollo v2 (ignored in v4+)
});

// Start server
(async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`\n🚀 Server running at: https://your-render-url.onrender.com/graphql`);
    console.log(`📦 MongoDB: ${process.env.MONGO_URI ? 'Loaded' : 'Missing'}`);
    console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured' : 'Missing'}`);
  });
})();
