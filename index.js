require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
(async () => {
    await server.start();
    server.applyMiddleware({ app });
})();

// Start Express Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}/graphql`);
});