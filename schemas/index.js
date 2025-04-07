const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        username: String!
        email: String!
        password: String!
        created_at: String
        updated_at: String
    }

    type Employee {
        _id: ID
        first_name: String!
        last_name: String!
        email: String!
        gender: String!
        designation: String!
        salary: Float!
        date_of_joining: String!
        department: String!
        employee_photo: String
        created_at: String
        updated_at: String
    }

    type AuthPayload {
        token: String
        user: User
    }

    type Query {
        login(username: String!, password: String!): AuthPayload
        getAllEmployees: [Employee]
        getEmployeeById(eid: ID!): Employee
        searchEmployeeByDesignationOrDepartment(designation: String, department: String): [Employee]
    }

    type Mutation {
        signup(username: String!, email: String!, password: String!): User
        addEmployee(first_name: String!, last_name: String!, email: String!, gender: String!, designation: String!, salary: Float!, date_of_joining: String!, department: String!, employee_photo: String): Employee
        updateEmployeeById(eid: ID!, first_name: String, last_name: String, email: String, gender: String, designation: String, salary: Float, date_of_joining: String, department: String, employee_photo: String): Employee
        deleteEmployeeById(eid: ID!): String
    }
`;

module.exports = typeDefs;
