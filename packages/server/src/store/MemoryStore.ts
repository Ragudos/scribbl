import type { MemoryStoreInterface } from "../consts";

export class MemoryStore<T> implements MemoryStoreInterface<T> {
	private data: Map<string, T>;

	constructor() {
		this.data = new Map<string, T>();
	}

	add(itemID: string, item: T): void {
		this.data.set(itemID, item);
	}

	get(itemID: string): T | undefined {
		return this.data.get(itemID);
	}

	delete(itemID: string): boolean {
		return this.data.delete(itemID);
	}

	getAll(): T[] {
		return [...this.data.values()];
	}

	get size(): number {
		return this.data.size;
	}
}
