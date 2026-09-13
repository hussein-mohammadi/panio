import { newId, nowIso } from '../ids.js';

export type InvitationStatus = 'PENDING' | 'USED' | 'EXPIRED';

export interface Invitation {
  id: string;
  shopId: string;
  createdBy: string;
  token: string;
  expiresAt: Date;
  status: InvitationStatus;
}

interface InvitationRow {
  id: string;
  shop_id: string;
  created_by: string;
  token: string;
  expires_at: string;
  status: InvitationStatus;
}

function toInvitation(row: InvitationRow): Invitation {
  return {
    id: row.id,
    shopId: row.shop_id,
    createdBy: row.created_by,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    status: row.status,
  };
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '').slice(0, 10);
}

const INVITE_TTL_DAYS = 7;

export class InvitationRepository {
  constructor(private readonly db: D1Database) {}

  async create(shopId: string, createdByTelegramUserId: number): Promise<Invitation> {
    const invitation: Invitation = {
      id: newId('invite'),
      shopId,
      createdBy: String(createdByTelegramUserId),
      token: randomToken(),
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    };
    await this.db
      .prepare(`INSERT INTO invitations (id, shop_id, created_by, token, expires_at, status) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(invitation.id, invitation.shopId, invitation.createdBy, invitation.token, invitation.expiresAt.toISOString(), invitation.status)
      .run();
    return invitation;
  }

  async findValidByToken(token: string): Promise<Invitation | null> {
    const row = await this.db
      .prepare(`SELECT * FROM invitations WHERE token = ? AND status = 'PENDING' AND expires_at > ?`)
      .bind(token, nowIso())
      .first<InvitationRow>();
    return row ? toInvitation(row) : null;
  }

  async markUsed(id: string): Promise<void> {
    await this.db.prepare(`UPDATE invitations SET status = 'USED' WHERE id = ?`).bind(id).run();
  }
}
