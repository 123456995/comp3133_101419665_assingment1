const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        login: async (_, { username, password }) => {
            const user = await User.findOne({ username });
            if (!user || user.password !== password) {
                throw new AuthenticationError('Invalid username or password');
            }

            const token = jwt.sign(
                { username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return { token, user };
        },

        getAllEmployees: async () => await Employee.find(),

        getEmployeeById: async (_, { eid }) => await Employee.findById(eid),

        searchEmployeeByDesignationOrDepartment: async (_, { designation, department }) => {
            let filter = {};
            if (designation) filter.designation = designation;
            if (department) filter.department = department;
            return await Employee.find(filter);
        }
    },

    Mutation: {
        signup: async (_, { username, email, password }) => {
            try {
                if (!username || !email || !password) {
                    throw new Error('All fields are required');
                }

                const user = new User({
                    username: username.trim(),
                    email: email.trim().toLowerCase(),
                    password // Plain text (not hashed)
                });

                return await user.save();
            } catch (error) {
                console.error('Signup error:', error.message);
                throw new Error('Signup failed: ' + error.message);
            }
        },

        addEmployee: async (_, args) => {
            const employee = new Employee(args);
            return await employee.save();
        },

        updateEmployeeById: async (_, { eid, ...updates }) => {
            const updatedEmployee = await Employee.findByIdAndUpdate(eid, updates, { new: true });
            return updatedEmployee;
        },

        deleteEmployeeById: async (_, { eid }) => {
            await Employee.findByIdAndDelete(eid);
            return "Employee deleted successfully.";
        }
    }
};

module.exports = resolvers;
