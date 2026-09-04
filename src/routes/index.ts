    import Router from 'express';
    import authRoutes from './auth.routes';
    import projectsRoutes from './projects.routes';
    import subscriptionsRoutes from './subscription.routes';
    import adminRoutes from "./admin/index"
    const router = Router();

    router.use('/auth', authRoutes);
    router.use('/projects',projectsRoutes);
    router.use('/subscription', subscriptionsRoutes);
    router.use('/admin',adminRoutes)

    export default router;
