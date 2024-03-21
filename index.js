const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// // JSON body parsing using built-in middleware
app.use(express.json());

// // Serve up the front-end static content hosting
app.use(express.static('public'));

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);



// // Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);



//LOGIN STUFF
////////////

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await DB.createUser(req.body.email, req.body.password);

    // Set the cookie
    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    });
  }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// GetUser returns information about a user
apiRouter.get('/user/:email', async (req, res) => {
  const user = await DB.getUser(req.params.email);
  if (user) {
    const token = req?.cookies.token;
    res.send({ email: user.email, authenticated: token === user.token });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});



////VEHICLES STUFF
//////////////////


// GetJetSkis
apiRouter.get('/jetSki', (_req, res) => {
    res.send(jetSkiList);
  });

// SubmitJetSki
apiRouter.post('/jetSki', (req, res) => {
    console.log(req.body);
    jetSkiList.push(req.body);
    res.send(jetSkiList);
});

// SubmitJetSki
apiRouter.post('/jetSkiList', (req, res) => {
    console.log(req.body);
    jetSkiList = req.body
    res.send(jetSkiList);
});

// GetSnowmobiles
apiRouter.get('/snowmobile', (_req, res) => {
    res.send(snowmobileList);
  });

// SubmitSnowmobile
apiRouter.post('/snowmobile', (req, res) => {
    console.log(req.body);
    snowmobileList.push(req.body);
    res.send(snowmobileList);
    });

    // SubmitSnowmobile
apiRouter.post('/snowmobileList', (req, res) => {
    console.log(req.body);
    snowmobileList = req.body
    res.send(snowmobileList);
});


// GetRazor
apiRouter.get('/razor', (_req, res) => {
    res.send(razorList);
  });

// SubmitRazor
apiRouter.post('/razor', (req, res) => {
    console.log(req.body);
    razorList.push(req.body);
    res.send(razorList);
    });

// SubmitSnowmobile
apiRouter.post('/razorList', (req, res) => {
    console.log(req.body);
    razorList = req.body
    res.send(razorList);
});

// GetScores
// apiRouter.get('/scores', (_req, res) => {
//   res.send(scores);
// });

// // SubmitScore
// apiRouter.post('/score', (req, res) => {
//   scores = updateScores(req.body, scores);
//   res.send(scores);
// });






let snowmobileList = []
let jetSkiList = []
let razorList = []
//needs to be below getters and setters
// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// // updateScores considers a new score for inclusion in the high scores.
// // The high scores are saved in memory and disappear whenever the service is restarted.
// let scores = [];
// function updateScores(newScore, scores) {
//   let found = false;
//   for (const [i, prevScore] of scores.entries()) {
//     if (newScore.score > prevScore.score) {
//       scores.splice(i, 0, newScore);
//       found = true;
//       break;
//     }
//   }

//   if (!found) {
//     scores.push(newScore);
//   }

//   if (scores.length > 10) {
//     scores.length = 10;
//   }

//   return scores;
// }
