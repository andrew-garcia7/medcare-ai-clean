const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'MedCare Healthcare API',
      version: '1.0.0',
      description: '🚀 Production-grade Healthcare Platform API',
      contact: {
        name: 'MedCare Team',
        email: 'api@medcare.com',
      },
    },

    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5000/api/v1',
        description: 'Current Environment',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },

        Doctor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            specialization: { type: 'string' },
            experience: { type: 'number' },
            averageRating: { type: 'number' },
          },
        },

        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            appointmentDate: { type: 'string' },
            status: { type: 'string' },
            payment: { type: 'object' },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },

      responses: {
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: ['./src/routes/*.js'], // auto read routes
};

module.exports = swaggerJsdoc(options);