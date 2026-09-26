export interface CachedCartItem {
  itemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY = "nomato_cart_offline_cache";

export function saveCartCache(items: CachedCartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to persist offline cart cache", err);
  }
}

export function loadCartCache(): CachedCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCartCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore error
  }
}
