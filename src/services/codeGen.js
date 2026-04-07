const generateCode = (schemaArray, authStrategy = 'None') => {
    // package.json dependencies
    const dependencies = {
        "cors": "^2.8.5",
        "express": "^4.18.2",
        "pg": "^8.11.3"
    };

    if (authStrategy === 'JWT') {
        dependencies["jsonwebtoken"] = "^9.0.2";
    }

    const packageJson = JSON.stringify({
        name: "generated-api",
        version: "1.0.0",
        description: "Auto-generated Express API",
        main: "server.js",
        scripts: {
            start: "node server.js"
        },
        dependencies
    }, null, 2);

    // db.js
    const dbJs = `const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
`;

    // server.js
    const serverJs = `const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(port, () => {
    console.log(\`Server is running on port \${port}\`);
});
`;

    // .env.example
    let envExample = `DATABASE_URL=postgres://user:password@localhost:5432/dbname\nPORT=3000\n`;
    if (authStrategy === 'API Key') {
        envExample += `API_KEY=your_secret_api_key_here\n`;
    } else if (authStrategy === 'JWT') {
        envExample += `JWT_SECRET=your_jwt_secret_key_here\n`;
    }

    // middleware/auth.js
    let authJs = '';
    if (authStrategy === 'API Key') {
        authJs = `module.exports = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};
`;
    } else if (authStrategy === 'JWT') {
        authJs = `const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
};
`;
    }

    // routes.js
    let routesJs = `const express = require('express');\nconst router = express.Router();\nconst pool = require('./db');\n\n`;

    if (authStrategy !== 'None') {
        routesJs += `const authMiddleware = require('./middleware/auth');\n`;
        routesJs += `router.use(authMiddleware);\n\n`;
    }

    schemaArray.forEach(table => {
        const tableName = table.tableName;
        const columns = table.columns || [];
        
        // Filter out 'id' for inserts since it's typically an auto-increment primary key
        const insertCols = columns.filter(c => c.name.toLowerCase() !== 'id').map(c => c.name);
        
        // Fallback: if all columns were named 'id' somehow, or we have an empty result
        if (insertCols.length === 0 && columns.length > 0) {
            insertCols.push(columns[0].name);
        }

        const colStr = insertCols.map(c => `"${c}"`).join(', ');
        const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(', ');
        const valParams = insertCols.map(c => `req.body["${c}"]`).join(', ');

        // GET all
        routesJs += `router.get('/${tableName}', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "${tableName}"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});\n\n`;

        // GET by id
        routesJs += `router.get('/${tableName}/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "${tableName}" WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});\n\n`;

        // POST (create)
        routesJs += `router.post('/${tableName}', async (req, res) => {
    try {
        const result = await pool.query(
            'INSERT INTO "${tableName}" (${colStr}) VALUES (${placeholders}) RETURNING *',
            [${valParams}]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});\n\n`;

        // DELETE
        routesJs += `router.delete('/${tableName}/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM "${tableName}" WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});\n\n`;
    });

    routesJs += `module.exports = router;\n`;

    const files = {
        'package.json': packageJson,
        'server.js': serverJs,
        'db.js': dbJs,
        'routes.js': routesJs,
        '.env.example': envExample
    };

    if (authStrategy !== 'None') {
        files['middleware/auth.js'] = authJs;
    }

    return files;
};

module.exports = generateCode;
