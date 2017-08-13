// @flow

import _ from 'lodash';
import express from 'express';

import appController from '../controllers/application.controller';
import resumeController from '../controllers/resume.controller';
import UploadService from '../services/upload.service';

import { 
    wrap,
    authMiddleware,
} from '../middleware';
import { BadRequestError } from '../errors';

const VALID_DECISIONS = ['accepted', 'rejected', 'waitlisted', 'undecided'];
const VALID_RSVP_VALUES = ['yes', 'no', 'undecided'];

export default function(app: express$Application, resumeStore: UploadService) {
    const appRouter = express.Router();

    const _validateSkills = function(skills: Array<any>): Array<string> {
        if (skills.length <= 0) return skills;

        return _.map(skills, skill => {
            if (typeof skill !== 'string') {
                throw new BadRequestError('Skills must be an array of valid meta-value strings');
            }
            
            return skill;
        });
    };

    const updateApplication = async (req: $Request, res: $Response) => {
        const userId = parseInt(req.body.user_id);
        const skills = _validateSkills(_.isArray(req.body.skills) ? req.body.skills : [])

        if (!userId) {
            throw new BadRequestError('Must provide a valid user id');
        }

        console.log(skills);

        const result = await appController
            .handleApplicationAndResume(userId, {
                ...req.body,
                skills,
            }, req.file, resumeStore);

        res.json({
            success: true,
            result,
        });
    };

    const judgeApplication = async (req: $Request, res: $Response) => {
        const applicationId = parseInt(req.body.application_id);
        const decision = typeof req.body.decision === 'string'
            ? req.body.decision.toLowerCase()
            : null;

        if (!applicationId) {
            throw new BadRequestError('Must provide an application id');
        }

        if (!decision || !VALID_DECISIONS.includes(decision)) {
            throw new BadRequestError('Must provide a valid decision string');
        }

        const application = await appController.judgeApplication(applicationId, decision);

        res.json({
            success: true,
            application,
        });
    };

    const updateRsvp = async (req: $Request, res: $Response) => {
        const applicationId = parseInt(req.body.application_id);
        const rsvp = typeof req.body.rsvp === 'string' 
            ? req.body.rsvp.toLowerCase()
            : null;

        if (!applicationId) {
            throw new BadRequestError('Must provide an application id');
        }

        if (!rsvp || !VALID_RSVP_VALUES.includes(rsvp)) {
            throw new BadRequestError('Must provide a valid rsvp string');
        }

        const application = await appController.updateRsvp(applicationId, rsvp);

        res.json({
            success: true,
            application,
        });
    };

    appRouter.put('/update', resumeStore.multer().single('resume'), wrap(updateApplication));
    appRouter.put('/judge', wrap(judgeApplication));
    appRouter.put('/rsvp', wrap(updateRsvp));
    app.use('/application', appRouter);
}