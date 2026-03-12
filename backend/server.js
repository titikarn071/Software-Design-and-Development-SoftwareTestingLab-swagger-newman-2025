const express = require('express');
const app = express();
app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

// สร้างตัวจำลอง Token ป้องกัน Server Error
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "ไม่ได้ส่ง Token มาด้วย" });
    }
    next();
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Hotel Booking API',
      version:     '1.0.0',
      description: 'REST API สำหรับระบบจองห้องพักออนไลน์ — ใบงาน Lab02A',
    },
    servers: [
      { url: '/', description: 'Development Server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Booking: {
          type: 'object',
          required: ['fullname', 'email', 'phone', 'checkin', 'checkout', 'roomtype', 'guests'],
          properties: {
            id:         { type: 'integer', example: 1 },
            fullname:   { type: 'string',  example: 'สมชาย ใจดี' },
            email:      { type: 'string',  format: 'email', example: 'somchai@example.com' },
            phone:      { type: 'string',  example: '0812345678' },
            checkin:    { type: 'string',  format: 'date',  example: '2026-12-01' },
            checkout:   { type: 'string',  format: 'date',  example: '2026-12-03' },
            roomtype:   { type: 'string',  enum: ['standard', 'deluxe', 'suite'], example: 'standard' },
            guests:     { type: 'integer', minimum: 1, maximum: 4, example: 2 },
            status:     { type: 'string',  example: 'pending' },
            comment:    { type: 'string',  example: 'ต้องการห้องชั้นล่าง' },
            created_at: { type: 'string',  example: '2026-01-01T00:00:00.000Z' },
          },
        },
        // ข้อ 1.1 — เพิ่ม Schema ใหม่ LoginResponse
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'แก้ไข Login Response description โดย [ชื่อ-นามสกุล ของคุณ]',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id:       { type: 'integer', example: 1 },
                username: { type: 'string',  example: 'admin' },
                role:     { type: 'string',  enum: ['admin', 'user'], example: 'admin' }
              }
            }
          }
        }
      },
    },
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =================================================================
// API Endpoints
// =================================================================

/**
 * @swagger
 * /api/health:
 * get:
 * summary: ตรวจสอบสถานะของ Server
 * description: ใช้สำหรับ Health Check — ไม่ต้องการ Authentication
 * tags: [System]
 * responses:
 * 200:
 * description: Server ทำงานปกติ
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:  { type: string,  example: ok }
 * uptime:  { type: number,  example: 120.5 }
 * time:    { type: string,  example: '2026-03-12T16:10:00.000Z' }
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    time:   new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/login:
 * post:
 * summary: เข้าสู่ระบบ
 * description: ตรวจสอบ username/password และคืนค่า JWT Token
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [username, password]
 * properties:
 * username:
 * type: string
 * example: admin
 * password:
 * type: string
 * example: admin123
 * responses:
 * 200:
 * description: เข้าสู่ระบบสำเร็จ — คืน JWT Token
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginResponse'
 * 400:
 * description: ไม่ได้ส่ง username หรือ password
 * 401:
 * description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
app.post('/api/login', (req, res) => { 
  res.status(200).json({ 
    token: "eyJhbGciOiJIUzI1...", 
    user: { id: 1, username: "admin", role: "admin" } 
  }); 
});

// ... (ใส่ API /api/bookings อื่นๆ ต่อจากนี้)

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📄 Swagger UI: http://localhost:${PORT}/api-docs`);
});