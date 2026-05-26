import { db } from './db';
import type { UserRow } from './db';

export type { UserRow };

export async function getAllUsers(): Promise<UserRow[]> {
  return db.users.toArray();
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  return db.users.get(id);
}

export async function addUser(user: UserRow): Promise<void> {
  await db.users.add(user);
}

export async function updateUser(id: string, data: Partial<Pick<UserRow, 'name' | 'avatar'>>): Promise<void> {
  await db.users.update(id, data);
}

export async function deleteUser(id: string): Promise<void> {
  await db.users.delete(id);
  await db.gridStates.where('userId').equals(id).delete();
}

export async function userCount(): Promise<number> {
  return db.users.count();
}
