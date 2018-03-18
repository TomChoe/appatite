const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const favoritesRouter = require('./routes/favoritesRouter');
const reviewRouter = require('./routes/reviewRouter');
const restaurantRouter = require('./routes/restaurantRouter');
const userRouter = require('./routes/userRouter');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(logger('dev'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/api/favorites', favoritesRouter);
app.use('/api/review', reviewRouter);
app.use('/api/restaurant', restaurantRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Up and listening in express on port ${PORT}`);
});
