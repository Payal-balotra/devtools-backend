    import Router from 'express';
    import authRoutes from './auth';
    import projectsRoutes from './projects';

    const router = Router();

    router.use('/auth', authRoutes);
    router.use('/projects',projectsRoutes);

    export default router;
