/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../module/user/user.interface';
import catchAsync from '../utils/catchAsync';
import User from '../module/user/user.model';

const auth = (...requiredRoles: UserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        // checking if the token is missing
        if (!token) {
            throw new Error('You are not authorized!');
        }
        // checking if the given token is valid
        const decoded = jwt.verify(
            token,
            "secrect",
        ) as JwtPayload;

        const { role, email } = decoded;

        // checking if the user is exist
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('This user is not found !')
        }

        // checking if the user is inactive
        const userStatus = user?.userStatus

        if (userStatus === 'inactive') {
            throw new Error('This user is blocked ! !')
        }

        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new Error(
                'You are not authorized',
            );
        }

        (req as any).user = decoded as JwtPayload;
        next();
    });
};

export default auth;