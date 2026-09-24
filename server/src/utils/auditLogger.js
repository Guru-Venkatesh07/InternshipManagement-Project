import prisma from '../config/db.js';

export const logAuditEvent = async ({
  actorUserId = null,
  action,
  resourceType,
  resourceId = null,
  ipAddress = null,
  metadata = null,
}) => {
  try {
    const metaString = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        resourceType,
        resourceId: resourceId ? String(resourceId) : null,
        ipAddress,
        metadata: metaString,
      },
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR] Failed to write audit log:', error.message);
  }
};
