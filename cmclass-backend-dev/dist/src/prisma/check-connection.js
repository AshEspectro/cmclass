"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = require("./prisma.service");
async function main() {
    const prisma = new prisma_service_1.PrismaService();
    try {
        const res = await prisma.testConnection();
        console.log('Connection OK:', res);
    }
    catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
