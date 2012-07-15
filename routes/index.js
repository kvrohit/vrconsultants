var ent = require('ent'),
    Recaptcha = require('recaptcha').Recaptcha,
    nodemailer = require("nodemailer");

var PUBLIC_KEY = 'PUBLIC_KEY',
    PRIVATE_KEY = 'PRIVATE_KEY';

var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: "username",
    pass: "password"
  }
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

var sendmail = function(data) {
  smtpTransport.sendMail({
    from: "from@example.com",
    to: "to@example.com",
    replyTo: data.username + " <" + data.email + ">",
    subject: "Enquery from " + data.username,
    text: data.message
  }, function(error, response) {
    if(error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
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
