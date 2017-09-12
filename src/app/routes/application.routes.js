// @flow

import _ from 'lodash';
import express from 'express';

import appController, { VALID_DECISIONS, VALID_RSVP_VALUES } from '../controllers/application.controller';
import UploadService from '../services/upload.service';

import { wrap, authMiddleware, adminMiddleware } from '../middleware';
import { BadRequestError, NotFoundError } from '../errors';

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

    const getApplicationByUserId = async (req: $Request, res: $Response) => {
        const owner = req.requester;

        if (!owner || !owner.id) {
            throw new BadRequestError('Must be signed in to update an application');
        }

        const application = await appController.getApplicationByUserId(owner.id);
        
        res.json({
            application,
        });
    };

    const updateApplication = async (req: $Request, res: $Response) => {
        const skills = _validateSkills(_.isArray(req.body.skills) ? req.body.skills : []);
        const owner = req.requester;

        if (!owner || !owner.id) {
            throw new BadRequestError('Must be signed in to update an application');
        }

        const result = await appController
            .handleApplicationAndResume(owner.id, {
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
        const owner = req.requester;
        const rsvp = typeof req.body.rsvp === 'string'
            ? req.body.rsvp.toLowerCase()
            : null;

        if (!owner || !owner.id) {
            throw new BadRequestError('Must be signed in to update an application');
        }

        if (!rsvp || !VALID_RSVP_VALUES.includes(rsvp)) {
            throw new BadRequestError('Must provide a valid rsvp string');
        }

        const application = await appController.updateRsvp(owner.id, rsvp);

        res.json({
            success: true,
            application,
        });
    };

    appRouter.use(authMiddleware);
    appRouter.get('/', wrap(getApplicationByUserId));
    appRouter.put('/update', resumeStore.multer().single('resume'), wrap(updateApplication));
    appRouter.put('/judge', adminMiddleware, wrap(judgeApplication));
    appRouter.put('/rsvp', wrap(updateRsvp));
    app.use('/application', appRouter);
}