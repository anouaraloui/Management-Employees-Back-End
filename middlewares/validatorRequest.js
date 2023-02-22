import { body, validationResult } from 'express-validator';

export const validateRequestUser = [
    body('firstName').notEmpty().withMessage('First Name is required')
                    .isLength({ min: 2, max: 10 })
                    .isString().trim().escape()
                    
                    .withMessage('First name should be between 2 and 10 characters'),
    body('lastName').notEmpty().withMessage('LastName is required')
                    .isLength({ min: 2, max: 10 })
                    .isString().trim().escape().withMessage('Last name should be between 2 and 10 characters'),
    body('email').isEmail().withMessage('Email is not valid').normalizeEmail(),
    
    body('role').notEmpty().isIn(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Engineer']).withMessage('Role is required'),

    body('building').notEmpty().isIn(['Front-End','Back-End','Full-Stack']).withMessage('Building is required'),

    body('phone').notEmpty().withMessage('Phone is required').isLength({ min: 12}).withMessage('must be at least 12 chars long'),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
];

export const validateRequestDaysOff = [
  body('startDay').notEmpty().isDate().withMessage('Satrt day is required '),
  body('endDay').notEmpty().isDate().withMessage('End day is required '),
  body('type').notEmpty().isString().isIn(["Paid", "Unpaid","Sick"]).withMessage('Type is required'),
  body('JustificationSick').isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateRequestDecision = [
  body('Status').isBoolean().notEmpty().withMessage('Should be send your answer about this request !'),
  body('JustificationDir') || body('JustificationMan').isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];