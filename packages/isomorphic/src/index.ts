export const hello = (name: string) => `Hello, ${name}!`;
export type Greeting = ReturnType<typeof hello>;

