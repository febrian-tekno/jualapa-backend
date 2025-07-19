const swaggerAutogen = require("swagger-autogen")();
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"];

const doc = {
  info: {
    title: "JualApa API",
    description: "Dokumentasi API",
  },
  host: "api.putrafebrian.online",
  schemes: ["http"],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅ swagger-output.json berhasil dibuat!");
});
