const express = require('express');
const app = express();
const port = 3000;

const bookingRouter = require('./routes/booking');

app.use(express.json());

app.use('/', bookingRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
