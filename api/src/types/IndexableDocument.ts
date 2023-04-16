
export interface IndexableDocument extends Record<string, string|number|boolean|Array<string|number|boolean>> {
  id: string;
}