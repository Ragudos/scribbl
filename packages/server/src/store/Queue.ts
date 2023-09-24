class Queue<T> {
  private data: T[];

  constructor() {
    this.data = new Array<T>();
  }

  add(item: T) {
    this.data.push(item);
  }

  dequeue(): T | undefined {
    return this.data.shift();
  }

  getFirst(): T | undefined {
    return this.data[0];
  }

  get isEmpty(): boolean {
    return this.data.length === 0;
  }

  get size(): number {
    return this.data.length;
  }

  removeLast(): T | undefined {
    return this.data.pop();
  }
};

export default Queue;