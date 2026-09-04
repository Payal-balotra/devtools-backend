    import Router from 'express';
    import productsRoutes from "../admin/product.routes"
    import pricesRoutes from "../admin/price.routes"
    import subscriptionRoutes from "../admin/subscription.routes"
    const router = Router();


    router.use('/products',productsRoutes)
    router.use('/prices',pricesRoutes);
    router.use('/subscriptions',subscriptionRoutes)

    export default router;
