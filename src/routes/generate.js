const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('pg');

const scanDatabase = require('../services/dbScanner');
const generateCode = require('../services/codeGen');
const createZip = require('../services/zipper');

router.post('/api/preview', async (req, res) => {
    const uri = req.body.dbUrl;

    if (!uri) {
        return res.status(400).json({ error: 'Database URI is required' })
    }

    const uriPattern = /^postgres(ql)?:\/\/.+:.+@.+\/.+$/
    if (!uriPattern.test(uri)) {
        return res.status(400).json({
            error: 'Invalid URI. Use: postgres://user:password@host:5432/dbname'
        })
    }

    let client;
    try {
        client = new Client({ connectionString: uri });
        await client.connect();
        await client.end();
    } catch (err) {
        if (err.message.includes('password')) {
            return res.status(401).json({ error: 'Authentication failed — check your username and password' });
        }
        if (err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ error: 'Could not connect — is your database server running?' });
        }
        if (err.message.includes('does not exist')) {
            return res.status(404).json({ error: 'Database not found — check your database name' });
        }
        return res.status(500).json({ error: err.message });
    }

    try {
        const schema = await scanDatabase(uri);
        res.json({ schema });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/generate', async (req, res) => {
    const { dbUrl, selectedTables, authStrategy, schema: reqSchema } = req.body;
    const uri = dbUrl;
    let tmpFilePath = null;

    try {
        let schema;

        if (reqSchema && Array.isArray(reqSchema)) {
            // Demo mode: bypass DB connection and use pre-supplied schema
            schema = reqSchema;
        } else {
            if (!uri) {
                return res.status(400).json({ error: 'Database URI is required' })
            }

            const uriPattern = /^postgres(ql)?:\/\/.+:.+@.+\/.+$/
            if (!uriPattern.test(uri)) {
                return res.status(400).json({
                    error: 'Invalid URI. Use: postgres://user:password@host:5432/dbname'
                })
            }

            let client;
            try {
                client = new Client({ connectionString: uri });
                await client.connect();
                await client.end();
            } catch (err) {
                if (err.message.includes('password')) {
                    return res.status(401).json({ error: 'Authentication failed — check your username and password' });
                }
                if (err.message.includes('ECONNREFUSED')) {
                    return res.status(503).json({ error: 'Could not connect — is your database server running?' });
                }
                if (err.message.includes('does not exist')) {
                    return res.status(404).json({ error: 'Database not found — check your database name' });
                }
                return res.status(500).json({ error: err.message });
            }

            schema = await scanDatabase(uri);
        }

        if (selectedTables && Array.isArray(selectedTables) && selectedTables.length > 0) {
            schema = schema.filter(table => selectedTables.includes(table.tableName));
        }

        const codeFiles = await generateCode(schema, authStrategy);

        tmpFilePath = path.join(os.tmpdir(), `${uuidv4()}.zip`);

        await createZip(codeFiles, tmpFilePath);

        res.download(tmpFilePath, 'api.zip', (err) => {
            if (err) {
                console.error('Error sending download:', err);
            }
            fs.unlink(tmpFilePath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                    console.error('Failed to cleanup temporary file:', unlinkErr);
                }
            });
        });
    } catch (error) {
        if (tmpFilePath && fs.existsSync(tmpFilePath)) {
            try {
                fs.unlinkSync(tmpFilePath);
            } catch (e) {
                console.error('Failed to cleanup temporary file after error:', e);
            }
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
