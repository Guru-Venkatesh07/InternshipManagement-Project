import prisma from '../config/db.js';

export const createNotification = async ({
  userId,
  message,
  notificationType = 'SYSTEM',
  referenceId = null,
}) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        message,
        notificationType,
        referenceId: referenceId ? String(referenceId) : null,
      },
    });
  } catch (error) {
    console.error('[NOTIFICATION_ERROR] Failed to dispatch notification:', error.message);
  }
};
