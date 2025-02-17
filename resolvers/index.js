const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        login: async (_, { username, password }) => {
            const user = await User.findOne({ username });
            if (!user) throw new AuthenticationError('Invalid username or password');

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) throw new AuthenticationError('Invalid username or password');

            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
                if (!password || typeof password !== 'string') {
                    throw new Error("Invalid password format. Password must be a string.");
                }
        
                const existingUser = await User.findOne({ $or: [{ username }, { email }] });
                if (existingUser) {
                    throw new Error('Username or Email already exists');
                }
        
                console.log("Received password:", password);
                console.log("Type of password:", typeof password);
        
                const saltRounds = 10; 
                const salt = await bcrypt.genSalt(saltRounds); // Generate the salt first
                const hashedPassword = await bcrypt.hash(password, salt); // Then use it for hashing
        
                console.log("Hashed password:", hashedPassword);
        
                const user = new User({
                    username,
                    email,
                    password: hashedPassword
                });
        
                await user.save();
                console.log("User created successfully:", user);
        
                return user;
            } catch (error) {
                console.error("Error in signup resolver:", error);
                throw new Error(error.message || "Failed to create user due to an internal error.");
            }
        },
        
        

        addEmployee: async (_, args) => {
            const employee = new Employee(args);
            await employee.save();
            return employee;
        },

        updateEmployeeById: async (_, { id, ...updateData }) => {
            const employee = await Employee.findByIdAndUpdate(
                id,
                { ...updateData, updated_at: new Date() },
                { new: true }
            );
            if (!employee) {
                throw new Error('Employee not found');
            }
            return employee;
        },

        deleteEmployeeById: async (_, { eid }) => {
            const employee = await Employee.findByIdAndDelete(eid);
            if (!employee) {
                throw new Error('Employee not found');
            }
            return `Employee with id ${eid} deleted successfully`;
        }
    }
};

module.exports = resolvers;