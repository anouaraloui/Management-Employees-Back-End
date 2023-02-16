import { body, validationResult, check } from 'express-validator';
import User from '../models/userModel.js';

export const validateRequest = [
    body('firstName').notEmpty().withMessage('First Name is required')
                    .isLength({ min: 2, max: 10 }).withMessage('First name should be between 2 and 10 characters'),
    body('lastName').notEmpty().withMessage('LastName is required')
    .isLength({ min: 2, max: 10 }).withMessage('Last name should be between 2 and 10 characters'),
    body('email').isEmail().withMessage('Email is not valid').normalizeEmail(),
    check('email').custom(value => {
        return User.findByEmail(value).then(user => {
          if (user) {
            return Promise.reject('E-mail already in use');
          }
        });
      }),
    body('role').notEmpty().withMessage('Role is required'),
    check('role').isIn([User.role]),
    body('building').notEmpty().withMessage('Building is required'),
    check('building').isIn([User.buiding]).withMessage('Building must be in table'),
    body('phone').notEmpty().withMessage('Phone is required').isLength({ min: 12}).withMessage('must be at least 12 chars long'),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];