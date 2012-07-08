var email = require('emailjs/email')
    , ent = require('ent')
    , Recaptcha = require('recaptcha').Recaptcha;

var PUBLIC_KEY = '6Lfrv9MSAAAAADbIfJN1HmYX28RthdxgOINzKeYV',
    PRIVATE_KEY = '6Lfrv9MSAAAAAGD7BEuMF_WcaJBwyHhFyAsxaC0-';

var server = email.server.connect({
  user: 'kvrohit',
  password: 'xxxxxxxxx',
  host: 'smtp.gmail.com',
  ssl: true
});

/*
 * Render the index page
 */

var renderIndex = function(req, res, recaptcha) {
  res.render('index', {
    title: 'VR Consultants - Catalysts for your success',
    flash: req.flash(),
    recaptcha_form: recaptcha.toHTML()
  });
};

/*
 * Send mail
 */

sendmail = function(data) {
  server.send({
    text:    data.message,
    from:    data.username + "<" + data.email + ">",
    to:      "rohit <kvrohit@gmail.com>",
    subject: "Enquery from " + data.username
  }, function(err, message) {
    console.log(err || message);
  });
};

/*
 * GET home page.
 */

exports.index = function(req, res) {
  var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);
  renderIndex(req, res, recaptcha);
};

/*
 * Handle the form post
 */

exports.sendmessage = function(req, res) {
  var data = {
    remoteip:  req.connection.remoteAddress,
    challenge: req.body.recaptcha_challenge_field,
    response:  req.body.recaptcha_response_field
  };

  var messageData = {
    username: ent.encode(req.body.username),
    email: ent.encode(req.body.email),
    message: ent.encode(req.body.message)
  };

  // console.log(messageData);

  var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

  recaptcha.verify(function(success, error_code) {
    if (success) {
      req.flash('success', 'Thank you! your message has been recorded');
      sendmail(messageData);
      res.redirect('/');
    }
    else {
      req.flash('error', 'Sorry, your message could not be recorded. Please try again');
      res.redirect('/');
    }
  });
};

