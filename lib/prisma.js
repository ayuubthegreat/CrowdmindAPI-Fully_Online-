import { PrismaClient } from "@prisma/client";

// Create a global variable to store the Prisma client instance
// This prevents multiple instances during development with hot reload
let prisma;

// Initialize Prisma client with connection pooling for serverless
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}


export default prisma;