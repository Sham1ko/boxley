import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ERP.AERO API",
      version: "1.0.0",
      description: "API документация для ERP.AERO",
    },
    servers: [
      {
        // Относительный url: Try it out бьёт в текущий origin — работает
        // и на localhost:3000, и на boxley.vercel.app
        url: "/api",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export default swaggerDocs;
