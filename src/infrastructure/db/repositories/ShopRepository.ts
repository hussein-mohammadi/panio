import { Shop, ShopStatus } from '../../../domain/shop/Shop.js';
import { ShopMember, MemberRole, MemberStatus } from '../../../domain/shop/ShopMember.js';
import { newId, nowIso } from '../ids.js';

interface ShopRow {
  id: string;
  name: string;
  owner_telegram_user_id: number;
  status: ShopStatus;
  settings: string;
  created_at: string;
  updated_at: string;
}

interface ShopMemberRow {
  id: string;
  shop_id: string;
  telegram_user_id: number;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
}

function toShop(row: ShopRow): Shop {
  return new Shop({
    id: row.id,
    name: row.name,
    ownerTelegramUserId: row.owner_telegram_user_id,
    status: row.status,
    settings: JSON.parse(row.settings),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

function toMember(row: ShopMemberRow): ShopMember {
  return new ShopMember({
    id: row.id,
    shopId: row.shop_id,
    telegramUserId: row.telegram_user_id,
    role: row.role,
    status: row.status,
    joinedAt: new Date(row.joined_at),
  });
}

export class ShopRepository {
  constructor(private readonly db: D1Database) {}

  async createShop(input: { name: string; ownerTelegramUserId: number }): Promise<Shop> {
    const shop = new Shop({ id: newId('shop'), name: input.name, ownerTelegramUserId: input.ownerTelegramUserId });

    await this.db.batch([
      this.db
        .prepare(
          `INSERT INTO shops (id, name, owner_telegram_user_id, status, settings, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          shop.id,
          shop.name,
          shop.ownerTelegramUserId,
          shop.status,
          JSON.stringify(shop.settings),
          shop.createdAt.toISOString(),
          shop.updatedAt.toISOString()
        ),
      this.db
        .prepare(
          `INSERT INTO shop_members (id, shop_id, telegram_user_id, role, status, joined_at)
           VALUES (?, ?, ?, 'OWNER', 'ACTIVE', ?)`
        )
        .bind(newId('member'), shop.id, input.ownerTelegramUserId, nowIso()),
    ]);

    return shop;
  }

  async findById(shopId: string): Promise<Shop | null> {
    const row = await this.db.prepare(`SELECT * FROM shops WHERE id = ?`).bind(shopId).first<ShopRow>();
    return row ? toShop(row) : null;
  }

  /** Server-side membership check — never trust a client-supplied shopId without this. */
  async getMembership(shopId: string, telegramUserId: number): Promise<ShopMember | null> {
    const row = await this.db
      .prepare(`SELECT * FROM shop_members WHERE shop_id = ? AND telegram_user_id = ? AND status = 'ACTIVE'`)
      .bind(shopId, telegramUserId)
      .first<ShopMemberRow>();
    return row ? toMember(row) : null;
  }

  /** All shops a Telegram user actively belongs to, most recently joined first. */
  async listShopsForUser(telegramUserId: number): Promise<Array<{ shop: Shop; member: ShopMember }>> {
    const { results } = await this.db
      .prepare(
        `SELECT s.*, m.id as member_id, m.role as member_role, m.status as member_status, m.joined_at as member_joined_at
         FROM shop_members m JOIN shops s ON s.id = m.shop_id
         WHERE m.telegram_user_id = ? AND m.status = 'ACTIVE'
         ORDER BY m.joined_at DESC`
      )
      .bind(telegramUserId)
      .all<ShopRow & { member_id: string; member_role: MemberRole; member_status: MemberStatus; member_joined_at: string }>();

    return results.map((row) => ({
      shop: toShop(row),
      member: toMember({
        id: row.member_id,
        shop_id: row.id,
        telegram_user_id: telegramUserId,
        role: row.member_role,
        status: row.member_status,
        joined_at: row.member_joined_at,
      }),
    }));
  }

  async addMember(shopId: string, telegramUserId: number, role: MemberRole): Promise<ShopMember> {
    const existing = await this.db
      .prepare(`SELECT * FROM shop_members WHERE shop_id = ? AND telegram_user_id = ?`)
      .bind(shopId, telegramUserId)
      .first<ShopMemberRow>();

    if (existing) {
      await this.db
        .prepare(`UPDATE shop_members SET status = 'ACTIVE', role = ? WHERE id = ?`)
        .bind(role, existing.id)
        .run();
      return toMember({ ...existing, status: 'ACTIVE', role });
    }

    const member = new ShopMember({ id: newId('member'), shopId, telegramUserId, role });
    await this.db
      .prepare(
        `INSERT INTO shop_members (id, shop_id, telegram_user_id, role, status, joined_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(member.id, member.shopId, member.telegramUserId, member.role, member.status, member.joinedAt.toISOString())
      .run();
    return member;
  }

  async listMembers(shopId: string): Promise<ShopMember[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM shop_members WHERE shop_id = ? AND status = 'ACTIVE' ORDER BY joined_at ASC`)
      .bind(shopId)
      .all<ShopMemberRow>();
    return results.map(toMember);
  }
}
