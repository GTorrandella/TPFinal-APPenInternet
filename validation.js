const check = require('express-validator/check/check')
var validation = {}

validation.old_user =  [
    // username must be an email
    check('email')
        .isEmail(),
    // password must be at least 5 chars long
    check('password')
        .isLength({ min: 5 })
        .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password confirmation does not match password');
            }
        })
]

module.exports = validation