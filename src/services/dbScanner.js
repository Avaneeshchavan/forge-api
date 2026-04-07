const { Client } = require('pg');

/**
 * Scans the connected PostgreSQL database and returns its public schema.
 * @param {string} dbUrl - The database connection URL.
 * @returns {Promise<Array>} Array of tables and their columns.
 */
const scanDatabase = async (dbUrl) => {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        // Exact query requested to get the schema details
        const query = "SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public';";
        
        const { rows } = await client.query(query);

        // Group columns by their respective tables
        const tablesMap = new Map();

        rows.forEach(row => {
            const { table_name, column_name, data_type, is_nullable } = row;
            
            if (!tablesMap.has(table_name)) {
                tablesMap.set(table_name, {
                    tableName: table_name,
                    columns: []
                });
            }

            tablesMap.get(table_name).columns.push({
                name: column_name,
                type: data_type,
                isNullable: is_nullable === 'YES'
            });
        });

        // Convert the map to the expected array format
        return Array.from(tablesMap.values());
    } finally {
        // CRITICAL: Ensure the client disconnects to prevent hanging connections
        await client.end();
    }
};

module.exports = scanDatabase;
