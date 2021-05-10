import pkg from "apollo-server";
import { v1 as uuid } from "uuid";
const { gql, ApolloServer, UserInputError } = pkg;

const persons = [
  {
    name: "Juanjo",
    phone: "044-222-22-1",
    street: "Avenida de la flor",
    city: "Valencia",
    id: "2a9410c2-59e9-42da-894c-f1b1c34ee4eb",
  },
  {
    name: "Maria",
    street: "Avenida de la Gracia",
    city: "Barcelona",
    id: "df1df775-6f74-4ee5-9e2e-e4744a31dd2f",
  },
];

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) return persons;

      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;
      return persons.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },

  Mutation: {
    addPerson: (root, args) => {
      // Validate if person Exists
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError("Name should be unique", {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person); // Update database with new person
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;

      const person = persons[personIndex];

      const updatedPerson = { ...person, phone: args.phone };
      persons[personIndex] = updatedPerson;
      return updatedPerson;
    },
  },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`);
});
