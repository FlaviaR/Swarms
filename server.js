const express = require('express')
const path = require('path');
const app = express()


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client')));

// use json body parser
// app.use(express.json())

// // api
// app.get('/api/posts', dosecurity, function (req, res) {
//     res.send('getting all posts');
// });

// app.get('/api/posts/:postId', function (req, res) {
//     res.send('getting one post');
// });

// app.post('/api/posts', function (req, res) {
//     res.send('saving a post');
// });

// catchall for when no routes are matched
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/index.html'));
});

const port = process.env.PORT || 3002
app.listen(port, () => console.log(`Server listening at ${port}`))

app.use('*.js', (req, res, next) => {
    res.set('Content-Type', 'text/javascript')
    next();
})