const express = require('express');
const cors = require('cors');
const createHttpError = require('http-errors');
const { get, add, del } = require('./storage');

module.exports = express()
    .use(cors())
    .use(express.json())
    .get('/storage', (req, res, next) => {
        const { key } = req.query;
        if (!key) {
            return next(createHttpError(400, 'Please provide a key'));
        }
        return get(key)
            .then((data) => {
                if (!data) return next(createHttpError(404, `Key ${key} not found`));
                return res.json(data);
            })
            .catch(next);
    })
    .post('/storage', (req, res, next) => {
        const data = req.body;
        console.log("Data")
        console.log(data)
        if (!data) {
            return next(createHttpError(400, 'Please provide a data'));
        }
        // Destructuring Assignment: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        const { key, expireDuration } = req.query;
        return add(data, key, expireDuration)
            .then((keys) => res.status(201).json({ keys }))
            .catch((error)=>{return res.status(400).send()});
    })
    .delete('/storage', (req, res, next) => {
        return del()
        .then(() => res.status(204).send())
        .catch(next)
    })
    .use((req, res, next) => next(createHttpError(404, `Unknown resource ${req.method} ${req.originalUrl}`)))
    .use((error, req, res, next) => {
        console.error(error);
        next(error);
    })
    .use((error, req, res) => res.status(error.status || 500).json({ error: error.message || 'Unknown error' }));
