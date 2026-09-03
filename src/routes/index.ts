    import Router from 'express';
    import authRoutes from './auth.routes';
    import projectsRoutes from './projects.routes';
    import subscriptionsRoutes from './subscription.routes';
    const router = Router();

    router.use('/auth', authRoutes);
    router.use('/projects',projectsRoutes);
    router.use('/subscription', subscriptionsRoutes);

    export default router;
