import { prisma } from '@/lib/prisma';

export async function logAuditEvent(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({ data: params });
}

export const audit = {
  userLogin: (userId: string, ip?: string) =>
    logAuditEvent({ userId, action: 'LOGIN', entity: 'user', entityId: userId, ip }),
  userLogout: (userId: string) =>
    logAuditEvent({ userId, action: 'LOGOUT', entity: 'user', entityId: userId }),
  articleCreate: (userId: string, articleId: string, details?: string) =>
    logAuditEvent({ userId, action: 'ARTICLE_CREATE', entity: 'article', entityId: articleId, details }),
  articleUpdate: (userId: string, articleId: string, details?: string) =>
    logAuditEvent({ userId, action: 'ARTICLE_UPDATE', entity: 'article', entityId: articleId, details }),
  articleDelete: (userId: string, articleId: string) =>
    logAuditEvent({ userId, action: 'ARTICLE_DELETE', entity: 'article', entityId: articleId }),
  userUpdate: (userId: string, targetUserId: string, details?: string) =>
    logAuditEvent({ userId, action: 'USER_UPDATE', entity: 'user', entityId: targetUserId, details }),
  mediaUpload: (userId: string, mediaId: string) =>
    logAuditEvent({ userId, action: 'MEDIA_UPLOAD', entity: 'media', entityId: mediaId }),
  reelCreate: (userId: string, reelId: string) =>
    logAuditEvent({ userId, action: 'REEL_CREATE', entity: 'reel', entityId: reelId }),
  reelUpdate: (userId: string, reelId: string) =>
    logAuditEvent({ userId, action: 'REEL_UPDATE', entity: 'reel', entityId: reelId }),
  reelDelete: (userId: string, reelId: string) =>
    logAuditEvent({ userId, action: 'REEL_DELETE', entity: 'reel', entityId: reelId }),
};
