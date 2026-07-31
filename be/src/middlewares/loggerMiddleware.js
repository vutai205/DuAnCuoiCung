const fs = require('fs');
const path = require('path');

const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMsg = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\n`;
        
        // Print to console
        console.log(logMsg.trim());

        // Append to logs.txt
        fs.appendFile(path.join(__dirname, '../../logs.txt'), logMsg, (err) => {
            if (err) {
                console.error('Error writing to logs.txt:', err);
            }
        });
    });

    next();
};

module.exports = loggerMiddleware;
