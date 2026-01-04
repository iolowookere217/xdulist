import { Router } from 'express';
import authRoutes from './authRoutes';
import expenseRoutes from './expenseRoutes';
import todoRoutes from './todoRoutes';
import userRoutes from './userRoutes';
import subscriptionRoutes from './subscriptionRoutes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/todos', todoRoutes);
router.use('/users', userRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;
